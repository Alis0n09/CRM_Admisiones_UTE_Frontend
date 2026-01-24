import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import SidebarAsesor from "../components/layout/SidebarAsesor";
import TopbarAsesor from "../components/layout/TopbarAsesor";

export default function AsesorLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#EBEBEB" }}>
      <SidebarAsesor />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: "260px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <TopbarAsesor />
        <Box sx={{ flex: 1, p: 3, bgcolor: "#EBEBEB", overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
