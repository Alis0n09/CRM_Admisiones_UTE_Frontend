import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import SidebarAsesor from "../components/layout/SidebarAsesor";

export default function AsesorLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <SidebarAsesor />
      <Box component="main" sx={{ flex: 1, p: 3, overflow: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
