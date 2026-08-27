import { createContext } from "svelte";

import type { Workspace } from "./workspace.svelte";

export const [getWorkspace, setWorkspace] = createContext<Workspace>();
