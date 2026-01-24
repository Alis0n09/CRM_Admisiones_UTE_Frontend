import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import SidebarAsesor from "../components/layout/SidebarAsesor";
import TopbarAsesor from "../components/layout/TopbarAsesor";

export default function AsesorLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <SidebarAsesor />
      <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "#f5f5f5" }}>
        <TopbarAsesor />
        <Box sx={{ flex: 1, pt: 2, pl: 2, pb: 2, pr: 1, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
