export interface TWDSidebarMenuItem {
  id?: string;
  name: string;
  pendingTasks: number;
  icon?: string;
  favorite?: boolean;
  route?: string;
}

export interface TWDSidebarMenu {
  title: string;
  items: TWDSidebarMenuItem[];
}
