import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/layout/SidebarAdmin";

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <SidebarAdmin />
      <Box component="main" sx={{ flex: 1, p: 3, overflow: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
