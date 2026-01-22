import { Box, Stack, Typography } from "@mui/material";

type LogoProps = {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  horizontal?: boolean;
  symbolOnly?: boolean;
};

export default function Logo({ size = "medium", showText = true, horizontal = false, symbolOnly = false }: LogoProps) {
  const sizes = {
    small: { symbol: 50, text: "h6", fontSize: "1.2rem" },
    medium: { symbol: 100, text: "h5", fontSize: "1.5rem" },
    large: { symbol: 300, text: "h2", fontSize: "3rem" },
  };

  const currentSize = sizes[size];

  const LogoContent = (
    <>
      {/* AV Symbol - Using logo.png from public folder */}
      <Box
        sx={{
          position: "relative",
          width: currentSize.symbol,
          height: currentSize.symbol,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="AliVicAdmission Logo"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 4px 16px rgba(139, 92, 246, 0.4))",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
      </Box>

      {/* Text */}
      {showText && (
        <Typography
          variant={currentSize.text as any}
          sx={{
            fontWeight: 800,
            background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 30%, #06b6d4 60%, #14b8a6 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            fontSize: currentSize.fontSize,
          }}
        >
          AliVicAdmission
        </Typography>
      )}
    </>
  );

  if (horizontal) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        {LogoContent}
      </Stack>
    );
  }

  return (
    <Stack direction="column" spacing={1} alignItems="center">
      {LogoContent}
    </Stack>
  );
}
