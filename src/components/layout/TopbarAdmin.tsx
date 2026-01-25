import { Box, IconButton, InputBase, Stack, Button, Badge, Typography } from "@mui/material";
import { Search, Notifications, Home } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function TopbarAdmin() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/admin/clientes?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate("/admin/clientes");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
        <IconButton
          onClick={handleSearch}
          sx={{
            p: 0,
            mr: 1,
            color: "#64748b",
            "&:hover": { color: "#3b82f6" },
          }}
        >
          <Search sx={{ fontSize: 20 }} />
        </IconButton>
        <InputBase
          placeholder="Buscar aspirantes..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ flex: 1, fontSize: "0.9rem", color: "#1e293b" }}
        />
      </Box>

      {/* Right Side - Home and Notifications */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        {/* Home Button with Icon and Text */}
        <Button
          onClick={() => navigate("/")}
          startIcon={<Home />}
          sx={{
            bgcolor: "#f5f5f5",
            color: "#1e293b",
            textTransform: "none",
            borderRadius: 2,
            px: 2,
            py: 0.75,
            "&:hover": { bgcolor: "#e5e7eb" },
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          Inicio
        </Button>

        {/* Notifications with Badge */}
        <IconButton
          sx={{
            bgcolor: "#f5f5f5",
            color: "#1e293b",
            "&:hover": { bgcolor: "#e5e7eb" },
            borderRadius: 2,
          }}
        >
          <Badge badgeContent={1} color="error">
            <Notifications />
          </Badge>
        </IconButton>
      </Stack>
    </Box>
  );
}
