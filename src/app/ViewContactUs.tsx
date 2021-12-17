import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// import Typography from '../components/Typography';
import { Typography } from '@mui/material';

import { ContactForm } from './ContactForm';

function ViewContactUs() {

    const [contactFormOpen, setContactFormOpen] = React.useState(false);

    return (
        <Container
            component="section"
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 9 }}
        >
            <Button onClick={() => setContactFormOpen(true)}
                sx={{
                    border: '4px solid currentColor',
                    borderRadius: 0,
                    height: 'auto',
                    py: 2,
                    px: 5,
                }}
            >
                <Typography variant="h4" component="span">
                    Got any questions? Need help?
                </Typography>
            </Button>
            <Typography variant="subtitle1" sx={{ my: 3 }}>
                We are here to help. Get in touch!
            </Typography>
            {false && <Box
                component="img"
                src="/static/themes/onepirate/producBuoy.svg"
                alt="buoy"
                sx={{ width: 60 }}
            />}
            {contactFormOpen && <ContactForm onClose={() => setContactFormOpen(false)} ></ContactForm>}
        </Container>

    );
}

export default ViewContactUs;