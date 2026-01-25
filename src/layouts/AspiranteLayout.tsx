import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import SidebarAspirante from "../components/layout/SidebarAspirante";
export default function AspiranteLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <SidebarAspirante />
      <Box component="main" sx={{ flex: 1, p: 3, overflow: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
