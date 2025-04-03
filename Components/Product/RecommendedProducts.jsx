import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Skeleton,
  Divider,
} from "@mui/material";
import Link from "next/link";
import RecommendIcon from "@mui/icons-material/Recommend";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useRecommendation } from "../../Contexts/Recommendation/RecommendationContext";
import logger from "../../Utils/logger";
import NoData from "../NoData";

/**
 * Component to display recommended products based on view history and user preferences
 */
const RecommendedProducts = ({ 
  productId, 
  type = "similar", 
  limit = 3,
  title = "" 
}) => {
  const { user, isAuthenticated } = useAuth();
  const { getSimilarProducts, recordInteraction } = useRecommendation();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set appropriate title based on recommendation type
  const getTitle = () => {
    if (title) return title;
    
    switch(type) {
      case "similar": return "Similar Products";
      case "personalized": return "Recommended For You";
      case "trending": return "Trending Products";
      case "new": return "New Arrivals";
      default: return "Recommended Products";
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      
      try {
        let results = [];
        
        // Use the appropriate method based on the type of recommendation needed
        if (type === "similar" && productId) {
          const response = await getSimilarProducts(productId, limit);
          
          // Handle the updated API response format
          if (response && response.success) {
            results = response.data || [];
            
            // Record this impression for recommendation analytics
            if (isAuthenticated && results.length > 0) {
              await recordInteraction(productId, "impression", {
                recommendationType: "similar",
              });
            }
          }
        }
        // Additional recommendation types would go here

        setRecommendations(results);
        setError(null);
      } catch (err) {
        logger.error(`Failed to fetch ${type} recommendations:`, err);
        setError(`Unable to load ${type} recommendations`);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if ((type === "similar" && productId) || 
        (type === "personalized" && isAuthenticated) ||
        ["trending", "new"].includes(type)) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [productId, type, isAuthenticated, limit, getSimilarProducts, recordInteraction]);

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          {getTitle()}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(limit)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
                <Skeleton variant="rectangular" height={160} animation="wave" />
                <CardContent>
                  <Skeleton variant="text" animation="wave" />
                  <Skeleton variant="text" width="60%" animation="wave" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={120} height={36} animation="wave" />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return null; // Silently fail for recommendations
  }

  if (!recommendations || recommendations.length === 0) {
    if (type === "personalized" && isAuthenticated) {
      return (
        <Box sx={{ mt: 4 }}>
          <NoData
            title="Explore more products"
            message="We'll show personalized recommendations based on your browsing history."
            suggestion="Start exploring products to get recommendations!"
            icon={
              <RecommendIcon
                sx={{ fontSize: 80, color: "primary.main", opacity: 0.8 }}
              />
            }
          />
        </Box>
      );
    }
    return null; // Don't show empty recommendations on product pages
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <RecommendIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" component="h2" sx={{ color: 'primary.main', fontWeight: 600 }}>
          {getTitle()}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {recommendations.map((recommendation) => {
          // Extract product from recommendation object - handle both formats
          const product = recommendation.product || recommendation;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card
                sx={{ 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column",
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                {product.thumbnail ? (
                  <CardMedia
                    component="img"
                    height="160"
                    image={product.thumbnail}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No image
                    </Typography>
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '40px'
                    }}
                  >
                    {product.tagline}
                  </Typography>

                  {product.category && (
                    <Chip
                      label={typeof product.category === 'object' ? product.category.name : product.category}
                      size="small"
                      sx={{ 
                        mt: 1, 
                        bgcolor: 'primary.light', 
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  )}
                  
                  {/* Display similarity info if available */}
                  {recommendation.similarityFeatures && recommendation.similarityFeatures.commonTagsCount > 0 && (
                    <Chip
                      label={`${recommendation.similarityFeatures.commonTagsCount} similar ${recommendation.similarityFeatures.commonTagsCount === 1 ? 'tag' : 'tags'}`}
                      size="small"
                      sx={{ 
                        mt: 1, 
                        ml: 1,
                        bgcolor: 'secondary.light',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Link href={`/product/${product.slug}`} passHref>
                    <Button 
                      size="small" 
                      color="primary" 
                      variant="contained"
                      sx={{ 
                        borderRadius: '20px',
                        px: 2,
                        boxShadow: 1
                      }}
                    >
                      View Product
                    </Button>
                  </Link>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThumbUpOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {product.upvoteCount || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {(product.views && product.views.count) || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default RecommendedProducts;
