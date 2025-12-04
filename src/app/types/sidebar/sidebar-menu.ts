export interface TWDSidebarMenu {
    title: string,
    items: TWDSidebarMenuItem[]
}

interface TWDSidebarMenuItem {
    name: string,
    pendingTasks: number,
    icon: TWDSidebarIcon
}

type TWDSidebarIcon = "project"| "today" | "upcoming"
