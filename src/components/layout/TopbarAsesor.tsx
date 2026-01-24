import { Box, IconButton, InputBase, Stack, Typography, Avatar, Menu, MenuItem } from "@mui/material";
import { Search, Notifications, KeyboardArrowDown } from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function TopbarAsesor() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const userInitials = user?.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "AS"
    : "AS";

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #e5e7eb",
        px: 3,
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Search Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "#f5f5f5",
          borderRadius: 2,
          px: 2,
          py: 0.75,
          width: { xs: "100%", md: 400 },
          border: "1px solid #e5e7eb",
        }}
      >
        <Search sx={{ color: "#64748b", mr: 1, fontSize: 20 }} />
        <InputBase
          placeholder="Buscar..."
          sx={{ flex: 1, fontSize: "0.9rem", color: "#1e293b" }}
        />
      </Box>

      {/* Right Side - Notifications and Profile */}
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Notifications */}
        <IconButton
          sx={{
            bgcolor: "#f5f5f5",
            color: "#1e293b",
            "&:hover": { bgcolor: "#e5e7eb" },
          }}
        >
          <Notifications />
        </IconButton>

        {/* User Profile */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          onClick={handleMenuOpen}
          sx={{
            cursor: "pointer",
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#3b82f6",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {userInitials}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", fontSize: "0.875rem" }}>
              {user?.email?.split("@")[0] || "Asesor"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
              Asesor
            </Typography>
          </Box>
          <KeyboardArrowDown sx={{ color: "#64748b", fontSize: 20 }} />
        </Stack>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
}
