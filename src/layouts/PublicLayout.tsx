import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Outlet />
    </Box>
  );
}
