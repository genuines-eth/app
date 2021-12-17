import * as React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { Button } from "@mui/material";

export const ContactForm = (props: { onClose: () => void }) => {

    const [values, setValues] = React.useState({ name: "", email: "", message: "" });

    /*
    const isValidEmail = (email: string) => {
        return email.length >= 5 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    }
    */
    const isValid = () => {
        return /*values.name.length >= 2 && */ values.message.length > 0 /*&& isValidEmail(values.email)*/
    }

    const onSubmit = async (e: any) => {
        if (isValid()) {
            props.onClose();
        }
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues(prevValues => ({ ...prevValues, [name]: value }));
    }

    return (
        <Dialog open={true} onClose={props.onClose}>
            <DialogTitle>Contact form</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a brief description of your request to send an email with your local email program. We'll get back to you asap.
                </DialogContentText>
                {false && <TextField name="name" label="Full name" value={values.name} onChange={handleOnChange} autoFocus fullWidth variant="standard" required />}
                {false /* && <TextField name="email" label="Email" error={values.email.length === 0 ? false : !isValidEmail(values.email)} value={values.email} onChange={handleOnChange} fullWidth variant="standard" type="email" required autoComplete="none" />*/}
                <TextField name="message" label="Message" value={values.message} onChange={handleOnChange} fullWidth multiline minRows={5} variant="standard" required />
            </DialogContent>
            <DialogActions>
                <Button tabIndex={-1} onClick={props.onClose}>Cancel</Button>
                <Button type="submit" disabled={!isValid()} onClick={onSubmit} target={"_top"}
                    href={`mailto:${encodeURIComponent(`"Genuines"<mbehr+genuines@mcbehr.de>`)}?subject=${encodeURIComponent(`genuine's question`)}&body=${encodeURIComponent(values.message)}`} >Submit</Button>
            </DialogActions>
        </Dialog>
    )
}