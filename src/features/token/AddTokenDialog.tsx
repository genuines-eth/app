import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { Divider, ListItemText, Typography } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { green } from '@mui/material/colors';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import List from '@mui/material/List';
import { ListItem, ListItemIcon, Checkbox } from '@mui/material';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import { DNSProver } from '@ensdomains/dnsprovejs';

import { ContractData } from '../wallet/walletSlice';
import TokenCard from './TokenCard';
import { RootState } from '../../app/store'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addTempTokenData, editTokenData, mintNewToken, /*contractProvider*/ } from '../wallet/walletSlice';
import { safeDomainNameFromUrl, isEmailAddr } from '../../utils';

interface DnsSecDomainEntry {
    dns: string, // assumed as unique key
    err?: string, // any error
    addrs?: string[], // a=... part from TXT entries
    txt?: string[], // TXT entries
    selected: boolean,
}

const isUseable = (entry: DnsSecDomainEntry): boolean => {
    if (entry.err) return false;
    if (!entry.addrs) return false;
    if (entry.addrs.length === 1) return true;
    return false;
}

export default function AddTokenDialog(props: { onClose: () => void, contract: ContractData, parentId: string }) {

    const [waitForPending, setWaitForPending] = React.useState<boolean>(false);
    const [activeStep, setActiveStep] = React.useState(0);
    const [dnsSecName, setDnsSecName] = React.useState("");

    const [dnsSecDomains, setDnsSecDomains] = React.useState<DnsSecDomainEntry[]>([]);
    const walletAddr = useAppSelector((state: RootState) => state.wallet.address);
    const tokensData = useAppSelector((state: RootState) => state.wallet.tokensData);
    const pendingRequests = useAppSelector((state: RootState) => state.wallet.pendingRequests);
    const dispatch = useAppDispatch();

    // do we have the temp token data yet?
    const tempTokenId = `${props.contract.address}-temp_${props.parentId}`;

    const nrSteps = props.contract.requiresAttestation ? 3 : 1;
    const steps = [`Provide ${props.contract.addName} data`, `Choose attestation method`, `Provide attestation input`];
    const AttestationMethodStep = 1;
    const AttestationInputStep = 2;

    React.useEffect(() => {
        if (!tokensData || !tokensData[tempTokenId]) {
            console.log(`AddTokenDialog useEffect[...] adding...`);
            // add it
            dispatch(addTempTokenData({ tokenId: tempTokenId, parentId: props.parentId }));
        }
    }, [tokensData, dispatch, props, tempTokenId])


    React.useEffect(() => {
        //console.log(`AddTokenDialog useEffect[pendingRequests=${pendingRequests}, waitForPending=${waitForPending}]`);

        if (waitForPending && !pendingRequests) {
            // hmm? is this enough? no race cond? todo find a better way
            setWaitForPending(false);
            // props.onClose(); todo shall we let the async thunk call on close?
        }
    }, [pendingRequests, waitForPending, props])

    React.useEffect(() => {
        if (tokensData && tokensData[tempTokenId] && tokensData[tempTokenId].attestationData?.method === 'dnssec') {
            let domainName = safeDomainNameFromUrl(tokensData[tempTokenId].data?.["external_link"] || "");
            if (domainName) {
                setDnsSecName(domainName);
                setDnsSecDomains([]);
            } else {
                setDnsSecName("");
                setDnsSecDomains([]);
            }

        }
    }, [tokensData, tempTokenId]);

    React.useEffect(() => {
        if (activeStep === AttestationInputStep) {
            const query_dns = async (dns: string): Promise<DnsSecDomainEntry> => {
                return new Promise((resolve, reject) => {
                    console.log(`AddTokenDialog useEffect[dnsprove, dnsSecName](${dns})...`);
                    const prover = DNSProver.create("https://cloudflare-dns.com/dns-query");

                    prover.queryWithProof('TXT', dns).then((result) => {
                        if (result) {
                            if (result.answer && result.answer.records && result.answer.records.length > 0 && result.answer.records[0].data.length > 0) {
                                let txtEntries = result.answer.records[0].data.map((a: any) => a.toString()) as string[]; // todo multiple entries?
                                let addrs: string[] = [];
                                for (const txt of txtEntries) {
                                    if (txt.startsWith("a=")) {
                                        addrs.push(txt.substring(2));
                                    }
                                }
                                resolve({ dns, txt: txtEntries, addrs, selected: false });
                            } else {
                                resolve({ dns, err: "no answer for TXT records", selected: false });
                            }
                        } else {
                            resolve({ dns, err: "unknown", selected: false });
                        }
                        console.log(`AddTokenDialog useEffect[dnsprove, dnsSecName](${dns}) got result=${JSON.stringify(result, (key, value) => key === 'data' ? `<data typeof=${typeof value} ${value?.constructor?.name} length=${value.length}>` : value, 2)}`);
                        console.log(`AddTokenDialog useEffect[dnsprove, dnsSecName](${dns}) got TXT=${result && result.answer ? result.answer.records[0].data : undefined}`);

                    }, (reason) => {
                        try {
                            console.warn(`AddTokenDialog useEffect[dnsprove, dnsSecName] got error = ${JSON.stringify(reason, (key, value) => key === 'data' ? `<data length=${value.length}>` : value, 2)}`);
                            if (Array.isArray(reason.result) && reason.result[0]?.data && reason.result[0].data.length > 0) {
                                let txtEntries = reason.result[0].data.map((a: any) => a.toString()) as string[]; // todo multiple entries?
                                console.log(`AddTokenDialog useEffect[dnsprove, dnsSecName] txtEntries=${JSON.stringify(txtEntries)}`);
                                let addrs: string[] = [];
                                for (const txt of txtEntries) {
                                    if (txt.startsWith("a=")) {
                                        addrs.push(txt.substring(2));
                                    }
                                }
                                resolve({ dns, err: reason.name, txt: txtEntries, addrs, selected: false });
                            } else {
                                resolve({ dns: dns, err: reason.name, selected: false });
                            }
                        } catch (e) {
                            console.error(`AddTokenDialog useEffect[dnsprove, dnsSecName](${dns}) got error='${e}'`);
                            reject(e);
                        }
                    })
                });
            }
            const query_all_dns = async (domainName: string) => {
                let newDnsSecNames: DnsSecDomainEntry[] = [];
                newDnsSecNames.push(await query_dns(dnsSecName));
                newDnsSecNames.push(await query_dns(`_genuines.${dnsSecName}`));
                newDnsSecNames.push(await query_dns(`_ens.${dnsSecName}`));

                // if there is exactly one useable one for us, pre-select it:
                let useable = newDnsSecNames.filter((e) => isUseable(e) && e.addrs?.[0] === walletAddr);
                if (useable.length === 1) {
                    useable[0].selected = true;
                }

                setDnsSecDomains(newDnsSecNames);
            }
            if (dnsSecName) {
                query_all_dns(dnsSecName);
            }
        }

    }, [activeStep, dnsSecName, walletAddr]);

    if (!tokensData || !tokensData[tempTokenId]) {
        return (<div>Loading...</div>);
    }

    const data = tokensData[tempTokenId];

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    const handleNext = () => {
        /*
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
          newSkipped = new Set(newSkipped.values());
          newSkipped.delete(activeStep);
        }*/
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        //setSkipped(newSkipped);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(`handleChange for '${e.currentTarget.id}/${e.target.id}/${e.currentTarget.name}' to '${e.target.value}'`);

        switch (e.currentTarget.id || e.currentTarget.name) {
            case 'attestation.method':
                dispatch(editTokenData({ tokenId: tempTokenId, attestationData: { 'method': e.target.value } }));
                break;
            default:
                dispatch(editTokenData({ tokenId: tempTokenId, data: { [e.currentTarget.id]: e.target.value } })); break;
        }
    }

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        //console.log(`handleSelectChange e = `, e);
        dispatch(editTokenData({ tokenId: tempTokenId, data: { [e.target.name]: e.target.value } }));
    }

    const handleOnAdd = () => {
        dispatch(mintNewToken({ tempTokenId, onFulfilled: props.onClose }));
        setWaitForPending(true);
    }

    const handleDnsSecToggle = (dnsSecDomain: DnsSecDomainEntry) => () => {
        let newDnsSecDomains = [...dnsSecDomains];
        // iterate through the values:
        newDnsSecDomains.forEach((d) => {
            if (d.dns === dnsSecDomain.dns) {
                d.selected = !dnsSecDomain.selected;
            } else {
                d.selected = false;
            }
        });
        setDnsSecDomains(newDnsSecDomains);
    }

    //console.log(`AddTokenDialog data = ${ JSON.stringify(data) } `);
    const validDataForStep = (step: number) => {
        switch (step) {
            case 0: // check all mandatory fields
                if (!(data.data && data.data["name"] && data.data["name"].length > 0)) return false;
                if (props.contract.data && "expected_attributes" in props.contract.data) {
                    if (!props.contract.data["expected_attributes"].every((attr: any) => {
                        // console.log(`validDataForStep: checking attr = ${ JSON.stringify(attr) } vs '${JSON.stringify(data.data[attr.abbrev])}'`);
                        if (!(data.data[attr.abbrev]?.length > 0)) return false;
                        return true;
                    })) return false;
                }
                return true;
            case AttestationMethodStep:
                return data.attestationData && data.attestationData.method.length > 0;
            case AttestationInputStep:
                if (data.attestationData?.method === "dnssec") {
                    if (dnsSecDomains.filter((e) => isUseable(e) && e.selected).length === 1) return true;
                } else if (data.attestationData?.method === "manual") {
                    if (isEmailAddr(data.data["a_man.email"])) return true;
                }
                return false; // todo
            default:
                return false;
        }
    }


    return (
        <Dialog open onClose={props.onClose}>
            <DialogTitle>{`Add ${props.contract.addName} `}</DialogTitle>
            <DialogContent dividers>
                {nrSteps > 1 && <React.Fragment><Stepper activeStep={activeStep}>
                    {steps.map((label, index) => {
                        const stepProps: { completed?: boolean } = {};
                        const labelProps: {
                            optional?: React.ReactNode;
                        } = {};
                        /*if (isStepOptional(index)) {
                            labelProps.optional = (
                                <Typography variant="caption">Optional</Typography>
                            );
                        }
                        if (isStepSkipped(index)) {
                            stepProps.completed = false;
                        }*/
                        return (
                            <Step key={label} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}</Stepper><Divider /></React.Fragment>}
                {activeStep === 0 && <React.Fragment>
                    <DialogContentText>
                        {`Fill in all mandatory fields to create a new ${props.contract.addName}.`}

                        {`All non - empty fields will be stored in the blockchain.`}

                        {false && ` parentId = '${props.parentId}'`}
                    </DialogContentText>

                    <TextField autoFocus id="name" value={data.data?.["name"] || ''} onChange={handleChange} label="Name" required margin="normal" variant="standard" sx={{ width: 0.5 }} />
                    <Divider />
                    <TextField id="image" value={data.data?.["image"] || ''} onChange={handleChange} label="Image" type="url" margin="normal" fullWidth variant="standard" helperText="e.g. https://... or ipfs://..." />
                    <TextField id="description" value={data.data?.["description"] || ''} onChange={handleChange} label="Description" multiline margin="normal" variant="standard" />
                    <TextField id="external_link" label="External Link" value={data.data?.["external_link"] || ''} onChange={handleChange} type="url" margin="normal" fullWidth variant="standard" placeholder="e.g. https://..." />
                    {props.contract.data && "expected_attributes" in props.contract.data && props.contract.data["expected_attributes"].map((attr: any) => {
                        if ("type" in attr && "enum" in attr.type) {
                            const enums: string[] = attr.type.enum || [];
                            return (<React.Fragment>
                                <InputLabel required>{attr.name}</InputLabel>
                                <Select id={attr.abbrev} label={attr.name} name={attr.abbrev} value={data.data?.[attr.abbrev] || ""} onChange={handleSelectChange} required variant="standard" fullWidth>
                                    {enums.map((e) => (<MenuItem value={e}>{e}</MenuItem>))}
                                </Select>
                            </React.Fragment>
                            );
                        } else
                            return <TextField id={attr.abbrev} name={attr.abbrev} label={attr.name} value={data.data?.[attr.abbrev] || ""} onChange={handleChange} required margin="normal" variant="standard" fullWidth />
                    })}
                </React.Fragment>}
                {activeStep === AttestationMethodStep && <React.Fragment>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Attestation method</FormLabel>
                        <RadioGroup id="attestation.method"
                            aria-label="attestation method"
                            name="attestation.method"
                            value={data.attestationData?.method || ""}
                            onChange={handleChange}
                        >
                            <FormControlLabel value="dnssec" control={<Radio />} label="DNS-Sec (free *)" />
                            <FormControlLabel value="manual" control={<Radio />} label="Manual (0.2 ETH **)" />
                        </RadioGroup>
                    </FormControl>
                    <Typography variant="subtitle2" paddingTop={1} > {`* plus contract/network gas fees to verify the DNS-Sec signatures.`}</Typography>
                    <Typography variant="subtitle2" paddingTop={1} > {`** plus network gas fees.`}</Typography>
                </React.Fragment>}
                {activeStep === AttestationInputStep && data.attestationData?.method === 'dnssec' && <React.Fragment>
                    <Typography variant="h6" paddingTop={1} > {`DNSSec via domain name "${dnsSecName}"`}</Typography>
                    <Typography variant="subtitle1">Select/confirm the domain and address to use:</Typography>
                    <Typography variant="body2" paddingTop={1}>The domain needs to be DNSSEC protected and have a '_genuines.' or '_ens.' TXT entry with exactly one adress stored as "a=0x...".</Typography>
                    <List dense sx={{ width: '100%' }}>
                        {dnsSecDomains.map((dnsSecDomain) => {
                            return (<ListItem key={dnsSecDomain.dns}
                                secondaryAction={
                                    <Checkbox color="primary" edge="end" disabled={!isUseable(dnsSecDomain)} checked={dnsSecDomain.selected} onChange={handleDnsSecToggle(dnsSecDomain)} />
                                }
                            >
                                <ListItemIcon>
                                    {dnsSecDomain.err ? <ErrorOutlineOutlinedIcon color="error" /> : <VerifiedOutlinedIcon color="success" />}
                                </ListItemIcon>
                                <ListItemText id={dnsSecDomain.dns} primary={`DNS: ${dnsSecDomain.dns}`} secondary={dnsSecDomain.err ? `${dnsSecDomain.err}` : `${(dnsSecDomain.addrs || []).join(",")}`} />
                            </ListItem>)
                        })}
                    </List>
                    {dnsSecDomains.filter((e) => isUseable(e) && e.selected).map((e) => {
                        if (e.addrs?.[0] !== walletAddr) {
                            return (<Typography variant="h6">{`Different domain owner! You can mint it but it will be created for the domain owner (${e.addrs?.[0]}) and you (${walletAddr}) cannot maintain it!`}</Typography>);
                        } else return null;
                    })}
                    {false && `foo DNS sec enabled domains:\n ${dnsSecDomains.map((o) => `${o.dns} ${o.err ? o.err : 'ok'} ${o.addrs ? o.addrs.join(",") : '<no addrs>'} ${o.txt ? o.txt.join(', ') : 'no txt entries'}`).join('\n ')}`}
                </React.Fragment>}
                {activeStep === AttestationInputStep && data.attestationData?.method === 'manual' && <React.Fragment>
                    <Typography variant="h6" paddingTop={1} > {`Manual attestation`}</Typography>
                    <Typography variant="subtitle1">Provide email where we can contact you for further details/proof.</Typography>
                    <Typography variant="subtitle2" paddingTop={1}>The email address entered will be stored in the blockchain!
                        The token will be created/minted for you but will be on hold until attestation took place.</Typography>
                    <Typography variant="subtitle2" paddingTop={1}>{`A fee of 0.2 Eth needs to be provided for the manual attestation process.`}</Typography>


                    <TextField id={"a_man.email"} name={"a_man.email"} label={"Email"} value={data.data?.["a_man.email"] || ""} onChange={handleChange} required margin="normal" variant="standard" type="email" fullWidth />
                </React.Fragment>}
                {nrSteps > 1 && <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                        Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    {/*isStepOptional(activeStep) && (
                            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                                Skip
                            </Button>
                        )*/}
                    <Button onClick={activeStep === steps.length - 1 ? handleOnAdd : handleNext} color="inherit" disabled={!validDataForStep(activeStep)}>
                        {activeStep === steps.length - 1 ? 'Add/Mint' : 'Next'}
                    </Button>
                </Box>}
                <Divider />
                <DialogContentText>
                    Preview
                </DialogContentText>
                <TokenCard tokenId={tempTokenId} />
            </DialogContent>
            <DialogActions>
                <Button disabled={pendingRequests > 0 || waitForPending} onClick={props.onClose}>Cancel</Button>
                <Button color="inherit" disabled={pendingRequests > 0 || waitForPending || activeStep < (nrSteps - 1) || !validDataForStep(activeStep)} onClick={handleOnAdd}>Add/Mint</Button>
                {(pendingRequests > 0 || waitForPending) && (
                    <CircularProgress
                        size={24 * 5}
                        sx={{
                            color: green[500],
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />
                )}
            </DialogActions>
        </Dialog>
    );
}
