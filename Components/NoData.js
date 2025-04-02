import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Link from 'next/link';

/**
 * Reusable component for displaying empty states
 */
const NoData = ({ 
  title = 'No Data Found', 
  message = 'There is nothing to display here.', 
  suggestion = 'Try a different search or check back later.',
  icon = <SearchOffIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.6 }} />,
  action = null,
  actionText = 'Explore Products',
  actionLink = '/'
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 5,
        px: 2
      }}
    >
      {icon}
      
      <Typography variant="h5" component="h2" sx={{ mt: 2, fontWeight: 'bold' }}>
        {title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3, maxWidth: 500 }}>
        {message}
        {suggestion && (
          <>
            <br />
            <span style={{ opacity: 0.8 }}>{suggestion}</span>
          </>
        )}
      </Typography>
      
      {action ? (
        action
      ) : (
        <Link href={actionLink} passHref>
          <Button 
            variant="contained" 
            color="primary"
            component="a"
          >
            {actionText}
          </Button>
        </Link>
      )}
    </Box>
  );
};

export default NoData;