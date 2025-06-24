import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Avatar } from '@mui/material';

function Navbar() {
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Container>
        <Toolbar disableGutters>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: "bold" 
            }}
          >
            Stock Price Prediction
          </Typography>
          <Box>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              sx={{ mx: 0.5 }}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/EDA"
              sx={{ mx: 0.5 }}
            >
              Explore Data
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/about"
              sx={{ mx: 0.5 }}
            >
              About
            </Button>
            <Button
              component={RouterLink}
              to="/Profile"
            >
              <Avatar 
                alt="User Profile"
                src="https://your-image-url.com"
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid skyblue',
                }}
              />
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;