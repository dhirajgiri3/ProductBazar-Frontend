"use client";
import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Skeleton, Chip, Stack, FormControl, Select, MenuItem } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useProduct } from "../../../Contexts/Product/ProductContext";
import ProductCard from '../../../Components/Products/ProductCard';
import EmptyState from '../../../Components/common/EmptyState';

const TrendingSection = ({ limit = 10 }) => {
  const { getTrendingProducts } = useProduct();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  
  // Effect to fetch trending products when component mounts or timeRange changes
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await getTrendingProducts(limit, timeRange);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError("Failed to load trending products");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendingProducts();
  }, [getTrendingProducts, limit, timeRange]);
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <EmptyState 
          title="Unable to load trending products"
          message="We encountered an error while loading trending products."
          action={{ label: "Refresh", onClick: () => window.location.reload() }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
          <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h2" fontWeight="bold">
            Trending Products
          </Typography>
        </Box>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            displayEmpty
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="24h">Last 24 hours</MenuItem>
            <MenuItem value="3d">Last 3 days</MenuItem>
            <MenuItem value="7d">Last week</MenuItem>
            <MenuItem value="30d">Last month</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        // Skeleton loading state
        <Grid container spacing={3}>
          {[...Array(limit)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton variant="text" height={30} width="70%" />
              <Skeleton variant="text" height={24} width="40%" />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Skeleton variant="rounded" height={30} width={100} />
                <Skeleton variant="circular" height={30} width={30} />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        // Empty state
        <EmptyState
          title="No trending products yet"
          message="Be the first to upload and engage with products!"
          icon={<TrendingUpIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.6 }} />}
        />
      ) : (
        // Products grid
        <Grid container spacing={3}>
          {products.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} key={product._id || index}>
              <ProductCard 
                product={product} 
                showBadge={index < 3}
                badgeContent={index === 0 ? "🔥 Hot" : index === 1 ? "🚀 Rising" : "⭐ Trending"}
                metrics={{
                  trendingScore: product.trendingScore,
                  position: index + 1
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {!loading && products.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Stack direction="row" spacing={1}>
            <Chip 
              label={`${timeRange === '24h' ? 'Today' : 
                timeRange === '3d' ? 'Last 3 days' : 
                timeRange === '7d' ? 'This week' : 
                'This month'}'s top products`} 
              color="primary" 
              variant="outlined" 
              size="small"
            />
            <Chip 
              label={`${products.length} products`}
              variant="outlined" 
              size="small" 
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default TrendingSection;
