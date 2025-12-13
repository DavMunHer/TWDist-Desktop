import { TWDProject } from "../../models/project.model";
import { TWDSection } from "../../models/section.model";
import { TWDTask } from "../../models/task.model";

export interface ProjectState {
  project: TWDProject | null;
  sections: Record<string, TWDSection>;
  tasks: Record<string, TWDTask>;
}
