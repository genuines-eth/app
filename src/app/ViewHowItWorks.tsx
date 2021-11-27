import * as React from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
// import Button from '../components/Button';
import { Button } from '@mui/material';
//import Typography from '../components/Typography';
import { Typography } from '@mui/material';

const item: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    px: 5,
    height: 400,
};

const number = {
    fontSize: 24,
    fontFamily: 'default',
    color: 'secondary.main',
    fontWeight: 'medium',
};

const image = {
    height: 200,
    my: 4,
};

function ViewHowItWorks() {
    return (
        <Box
            component="section"
            sx={{ display: 'flex', bgcolor: "alpha('secondary.light', 0.3)", overflow: 'hidden' }}
        >
            <Container
                sx={{
                    mt: 10,
                    mb: 15,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box
                    component="img"
                    // src="/static/themes/onepirate/productCurvyLines.png"
                    //src="/canstockphoto24755970.jpg"
                    alt="curvy lines"
                    sx={{
                        pointerEvents: 'none',
                        position: 'absolute',
                        top: -60,
                        opacity: 0.3,
                        height: 600,
                        zIndex: 0
                    }}
                />
                <Typography variant="h4" component="h2" sx={{ mb: 14 }}>
                    How it works
                </Typography>
                <div>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={4}>
                            <Box sx={item}>
                                <Box sx={number}>1.</Box>
                                <Box
                                    component="img"
                                    // Photo by <a href="https://unsplash.com/@wimvanteinde?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Wim van 't Einde</a> on <a href="https://unsplash.com/s/photos/authentic-product?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
                                    src="/wim-van-t-einde-0D_7Ji4zEKk-unsplash.jpg"

                                    alt="your brand here"
                                    sx={image}
                                />
                                <Typography variant="h5" align="center">
                                    OEMs / brands / certified dealer register their products.
                                </Typography>
                            </Box>
                            <Button
                                color="secondary"
                                size="large"
                                variant="contained"
                                sx={{ mt: 8 }}
                                component={Link}
                                to="/oems"
                            >
                                Manage products
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={item}>
                                <Box sx={number}>2.</Box>
                                <Box
                                    component="img"
                                    // src="/stil-ZCfGjkbJsU0-unsplash.jpg" // Photo by <a href="https://unsplash.com/@stilclassics?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">STIL</a> on <a href="https://unsplash.com/collections/1676433/luxury-lifestyle-brands?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
                                    // Photo by <a href="https://unsplash.com/@brett_jordan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Brett Jordan</a> on <a href="https://unsplash.com/s/photos/fake-or-real?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
                                    // src="/brett-jordan-zVkL5L7eGrw-unsplash.jpg"

                                    // Photo by <a href="https://unsplash.com/@marxgall?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Marek Szturc</a> on <a href="https://unsplash.com/collections/3415596/watch?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
                                    // src="/marek-szturc-IfZVE7HsXp8-unsplash.jpg"

                                    src="/canstockphoto24755970.jpg" // <!-- HTML Credit Code for Can Stock Photo -->
                                    // <a href="https://www.canstockphoto.com">(c) Can Stock Photo / albund</a>

                                    alt="customer"
                                    sx={image}
                                />
                                <Typography variant="h5" align="center">
                                    Customer can check any registered product for authenticity.
                                </Typography>
                            </Box>
                            <Button
                                color="secondary"
                                size="large"
                                variant="contained"
                                component={Link}
                                to="/customer/check"
                                sx={{ mt: 8 }}
                            >
                                Check authenticity
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={item}>
                                <Box sx={number}>3.</Box>
                                <Box
                                    component="img"
                                    src="/cytonn-photography-vWchRczcQwM-unsplash.jpg" // Photo by <a href="https://unsplash.com/@cytonn_photography?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Cytonn Photography</a> on <a href="https://unsplash.com/s/photos/deal-handshake?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
                                    alt="trade"
                                    sx={image}
                                />
                                <Typography variant="h5" align="center">
                                    Customers can buy products safely from current owners.
                                    Fakes are detected. Money transfer is guaranteed.
                                </Typography>
                            </Box>
                            <Button
                                color="secondary"
                                size="large"
                                variant="contained"
                                component={Link}
                                to="/customer/trade"
                                sx={{ mt: 8 }}
                            >
                                Trade
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </Container>
        </Box>
    );
}

export default ViewHowItWorks;