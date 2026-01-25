import { Box, IconButton, InputBase, Stack, Button, Badge } from "@mui/material";
import { Search, Notifications, Home } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function TopbarAsesor() {
  const navigate = useNavigate();

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
          placeholder="Buscar aspirantes..."
          sx={{ flex: 1, fontSize: "0.9rem", color: "#1e293b" }}
        />
      </Box>

      {/* Right Side - Home and Notifications */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        {/* Home Button with Icon and Text */}
        <Button
          onClick={() => navigate("/asesor")}
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
