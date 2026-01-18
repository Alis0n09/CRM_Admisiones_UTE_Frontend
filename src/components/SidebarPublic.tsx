import { Box, Divider, List, ListItemButton, ListItemText, Typography } from "@mui/material";

export default function SidebarPublic() {
  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "white",
        borderRight: "1px solid #eee",
        p: 2,
      }}
    >
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Box
          component="img"
          src="/logo.jpeg"
          alt="Logo"
          sx={{ width: 240, height: 240, objectFit: "contain", mb: 1 }}
          onError={(e) => {
            
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <Typography fontWeight={700}>Ute AliVic Admisiones</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        EXPLORAR
      </Typography>

      <List dense>
        <ListItemButton component="a" href="#becas">
          <ListItemText primary="Becas" />
        </ListItemButton>
        <ListItemButton component="a" href="#carreras">
          <ListItemText primary="Carreras" />
        </ListItemButton>
        <ListItemButton component="a" href="#formulario">
          <ListItemText primary="Quiero información" />
        </ListItemButton>
        <ListItemButton component="a" href="#contacto">
          <ListItemText primary="Contacto" />
        </ListItemButton>
      </List>
    </Box>
  );
}
