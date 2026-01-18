import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import SidebarPublic from "../components/SidebarPublic";

export default function PublicLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f7f7" }}>
      <SidebarPublic />

      <Box component="main" sx={{ flex: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
