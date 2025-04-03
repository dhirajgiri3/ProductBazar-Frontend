import React from 'react';
import { Box, Typography, Divider, CircularProgress } from '@mui/material';
import RecommendIcon from '@mui/icons-material/Recommend';
import RecommendedProducts from './Product/RecommendedProducts';

/**
 * A reusable component for displaying recommendations sections
 * on various pages with consistent styling
 */
const RecommendationSection = ({ 
  title = "Recommended For You", 
  productId = null, 
  limit = 3,
  loading = false
}) => {
  if (loading) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center', py: 4 }}>
        <CircularProgress color="primary" size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading recommendations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <RecommendIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" component="h2" sx={{ color: 'primary.main', fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      <RecommendedProducts productId={productId} limit={limit} />
    </Box>
  );
};

export default RecommendationSection;
