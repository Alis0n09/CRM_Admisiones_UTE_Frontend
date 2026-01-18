import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";

type Props = {
  title: string;
  desc: string;
  img: string;
};

export default function CareerCard({ title, desc, img }: Props) {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
      <CardActionArea>
        <CardMedia component="img" height="160" image={img} alt={title} />
        <CardContent>
          <Typography fontWeight={800} variant="subtitle1">
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {desc}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
