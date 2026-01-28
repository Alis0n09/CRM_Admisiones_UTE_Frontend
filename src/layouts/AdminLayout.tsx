import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/layout/SidebarAdmin";
import TopbarAdmin from "../components/layout/TopbarAdmin";

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#EBEBEB" }}>
      <SidebarAdmin />
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
        <TopbarAdmin />
        <Box sx={{ flex: 1, p: 3, bgcolor: "#EBEBEB", overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
