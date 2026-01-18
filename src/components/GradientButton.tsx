import { Button, type ButtonProps } from "@mui/material";

export default function GradientButton(props: ButtonProps) {
  return (
    <Button
      {...props}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        borderRadius: 2,
        px: 3,
        py: 1.2,
        background: "linear-gradient(135deg, #4c1d95, #8b5cf6, #10b981)",
        color: "white",
        boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
        transition: "all 0.3s ease",

        "&:hover": {
          background: "linear-gradient(135deg, #5b21b6, #7c3aed, #22c55e)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.3)",
          transform: "translateY(-2px)",
        },

        "&:active": {
          transform: "scale(0.97)",
        },
      }}
    />
  );
}
