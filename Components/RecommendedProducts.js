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
import axios from "axios";
import NoData from "./NoData";
import RecommendIcon from "@mui/icons-material/Recommend";
import { useAuth } from "../Contexts/Auth/AuthContext";
import api from "../Utils/api";

const getAuthToken = api.getAccessToken;

/**
 * Component to display recommended products based on view history
 */
const RecommendedProducts = ({ productId, limit = 3 }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        // Different endpoints for authenticated and anonymous users
        const endpoint = user
          ? `${API_URL}/recommendations/personalized`
          : `${API_URL}/recommendations/similar/${productId}`;

        // Optional headers for auth
        const headers = {};
        const token = getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Parameters change based on if we're looking at a product page
        const params = productId
          ? { currentProduct: productId, limit }
          : { limit };

        const response = await axios.get(endpoint, { params, headers });
        setRecommendations(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Unable to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we're on a product page or the user is logged in
    if (productId || user) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [productId, user, limit]);

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Recommended Products
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(limit)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: "100%" }}>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={120} height={36} />
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
    if (!productId && user) {
      // No recommendations for homepage and logged in
      return (
        <Box sx={{ mt: 4 }}>
          <NoData
            title="Explore more products"
            message="We'll show personalized recommendations based on your browsing history."
            suggestion="Start exploring products to get recommendations!"
            icon={
              <RecommendIcon
                sx={{ fontSize: 80, color: "text.secondary", opacity: 0.6 }}
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
        <Typography variant="h5" component="h2">
          {user ? "Recommended For You" : "Similar Products"}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {recommendations.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              {product.thumbnail ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={product.thumbnail}
                  alt={product.name}
                />
              ) : (
                <Box
                  sx={{
                    height: 140,
                    bgcolor: "grey.200",
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
                <Typography variant="h6" component="div" gutterBottom>
                  {product.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  noWrap
                >
                  {product.tagline}
                </Typography>

                {product.category && (
                  <Chip
                    label={product.category.name}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>

              <CardActions>
                <Link href={`/product/${product.slug}`} passHref>
                  <Button size="small" color="primary" component="a">
                    View Product
                  </Button>
                </Link>

                <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    {product.upvotes} upvotes
                  </Typography>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecommendedProducts;
