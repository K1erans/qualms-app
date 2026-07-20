use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};

const BRIDGE_EVENT: &str = "qualms://bridge-message";

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct BridgeRequest {
    id: String,
    method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    params: Option<Value>,
}

struct BridgeState {
    supervisor: Mutex<Supervisor<CommandChild>>,
}

impl Default for BridgeState {
    fn default() -> Self {
        Self {
            supervisor: Mutex::new(Supervisor::default()),
        }
    }
}

struct Supervisor<T> {
    child: Option<T>,
}

impl<T> Default for Supervisor<T> {
    fn default() -> Self {
        Self { child: None }
    }
}

impl<T> Supervisor<T> {
    fn child_mut(&mut self) -> Option<&mut T> {
        self.child.as_mut()
    }

    fn install(&mut self, child: T) -> bool {
        if self.child.is_some() {
            return false;
        }

        self.child = Some(child);
        true
    }

    fn is_running(&self) -> bool {
        self.child.is_some()
    }

    fn take(&mut self) -> Option<T> {
        self.child.take()
    }
}

#[derive(Default)]
struct LineBuffer {
    pending: Vec<u8>,
}

impl LineBuffer {
    fn push(&mut self, bytes: &[u8]) -> Vec<String> {
        self.pending.extend_from_slice(bytes);
        let mut lines = Vec::new();

        while let Some(index) = self.pending.iter().position(|byte| *byte == b'\n') {
            let line = self.pending.drain(..=index).collect::<Vec<_>>();
            let line = &line[..line.len() - 1];
            if let Ok(text) = String::from_utf8(line.to_vec()) {
                lines.push(text);
            }
        }

        lines
    }
}

fn write_request(child: &mut CommandChild, request: &BridgeRequest) -> Result<(), String> {
    let mut message = serde_json::to_vec(request).map_err(|error| error.to_string())?;
    message.push(b'\n');
    child.write(&message).map_err(|error| error.to_string())
}

#[tauri::command]
fn bridge_start(app: AppHandle, state: State<'_, BridgeState>) -> Result<(), String> {
    let mut supervisor = state
        .supervisor
        .lock()
        .map_err(|error| error.to_string())?;
    if supervisor.is_running() {
        return Ok(());
    }

    let sidecar = app
        .shell()
        .sidecar("qualms")
        .map_err(|error| error.to_string())?
        .set_raw_out(true)
        .arg("bridge");
    let (mut events, child) = sidecar.spawn().map_err(|error| error.to_string())?;
    supervisor.install(child);
    drop(supervisor);

    let event_app = app.clone();
    tauri::async_runtime::spawn(async move {
        let mut stdout = LineBuffer::default();
        while let Some(event) = events.recv().await {
            match event {
                CommandEvent::Stdout(bytes) => {
                    for line in stdout.push(&bytes) {
                        if let Ok(message) = serde_json::from_str::<Value>(&line) {
                            let _ = event_app.emit(BRIDGE_EVENT, message);
                        }
                    }
                }
                CommandEvent::Stderr(bytes) => {
                    let message = String::from_utf8_lossy(&bytes).to_string();
                    let _ = event_app.emit(
                        BRIDGE_EVENT,
                        serde_json::json!({
                            "id": null,
                            "ok": false,
                            "error": { "code": "INTERNAL_ERROR", "message": message }
                        }),
                    );
                }
                CommandEvent::Error(message) => {
                    let _ = event_app.emit(
                        BRIDGE_EVENT,
                        serde_json::json!({
                            "id": null,
                            "ok": false,
                            "error": { "code": "INTERNAL_ERROR", "message": message }
                        }),
                    );
                }
                CommandEvent::Terminated(_) => {
                    if let Ok(mut supervisor) =
                        event_app.state::<BridgeState>().supervisor.lock()
                    {
                        supervisor.take();
                    }
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn bridge_request(
    request: BridgeRequest,
    state: State<'_, BridgeState>,
) -> Result<(), String> {
    let mut supervisor = state
        .supervisor
        .lock()
        .map_err(|error| error.to_string())?;
    let child = supervisor
        .child_mut()
        .ok_or_else(|| "The Qualms bridge is not running.".to_string())?;
    write_request(child, &request)
}

#[tauri::command]
fn bridge_stop(state: State<'_, BridgeState>) -> Result<(), String> {
    let mut supervisor = state
        .supervisor
        .lock()
        .map_err(|error| error.to_string())?;
    if let Some(child) = supervisor.child_mut() {
        write_request(
            child,
            &BridgeRequest {
                id: "desktop-shutdown".to_string(),
                method: "system.shutdown".to_string(),
                params: None,
            },
        )?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(BridgeState::default())
        .invoke_handler(tauri::generate_handler![
            bridge_start,
            bridge_request,
            bridge_stop
        ])
        .build(tauri::generate_context!())
        .expect("failed to build Qualms desktop application")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                if let Ok(mut supervisor) = app.state::<BridgeState>().supervisor.lock() {
                    if let Some(child) = supervisor.take() {
                        let _ = child.kill();
                    }
                }
            }
        });
}

#[cfg(test)]
mod tests {
    use super::{LineBuffer, Supervisor};

    #[test]
    fn reconstructs_split_and_multiple_ndjson_messages() {
        let mut buffer = LineBuffer::default();

        assert!(buffer.push(b"{\"id\":\"1\"").is_empty());
        assert_eq!(
            buffer.push(b"}\n{\"id\":\"2\"}\n"),
            vec!["{\"id\":\"1\"}", "{\"id\":\"2\"}"]
        );
    }

    #[test]
    fn supervisor_rejects_duplicate_children_and_releases_on_exit() {
        let mut supervisor = Supervisor::default();

        assert!(supervisor.install("first"));
        assert!(!supervisor.install("second"));
        assert!(supervisor.is_running());
        assert_eq!(supervisor.take(), Some("first"));
        assert!(!supervisor.is_running());
    }
}
