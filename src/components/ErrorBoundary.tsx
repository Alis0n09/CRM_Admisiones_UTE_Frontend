import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>Algo salió mal</Typography>
          <Typography sx={{ mb: 2 }}>{this.state.error?.message || "Error desconocido"}</Typography>
          <Button variant="contained" onClick={() => window.location.href = "/"}>Volver al inicio</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
