import { Box, Container, Typography, Divider } from "@mui/material";

export default function PolicyPage({ title, updated, intro, sections }) {
  return (
    <Box>
      <Box sx={{ bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: { xs: 30, md: 42 } }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Last updated: {updated}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
        {intro && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {intro}
          </Typography>
        )}
        {sections.map((s, i) => (
          <Box key={s.heading} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              {i + 1}. {s.heading}
            </Typography>
            {s.body.map((p, j) => (
              <Typography key={j} variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.8 }}>
                {p}
              </Typography>
            ))}
            {i < sections.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))}
      </Container>
    </Box>
  );
}
