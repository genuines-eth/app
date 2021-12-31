import * as React from 'react';

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button'
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { grey } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import { Skeleton } from '@mui/material';
import { ContractData } from '../wallet/walletSlice';
import AddTokenDialog from './AddTokenDialog';


interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export default function AddTokenCard(props: { contract: ContractData, parentId: string }) {
    const [expanded, setExpanded] = React.useState(false);
    const [addOpen, setAddOpen] = React.useState(false);

    const handleAddClick = () => {
        if (!addOpen) {
            setAddOpen(true);
        }
    }

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    if (!props.contract.data) {
        return (
            <Card sx={{ maxWidth: 345 }}>
                <CardHeader avatar={
                    <Skeleton variant="circular">
                        <Avatar />
                    </Skeleton>
                }
                    action={
                        <IconButton aria-label="settings">
                            <MoreVertIcon />
                        </IconButton>
                    }
                    title={`Add Token ${props.contract.contractName}`} />
                <Skeleton height={150} />
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        {<Skeleton />}
                    </Typography>
                </CardContent>
                <CardActions disableSpacing>
                    <Button color="secondary" variant="contained" sx={{ marginLeft: "auto" }} startIcon={<AddBoxOutlinedIcon />}>
                        Add new {props.contract.addName}
                    </Button>
                </CardActions>
            </Card>
        );
    }

    return (
        <div>
            <Card sx={{ maxWidth: 345 }}>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: grey[500] }} aria-label={props.contract.addName}>
                            {props.contract.addName.slice(0, 1).toUpperCase()}
                        </Avatar>
                    }
                    action={
                        <IconButton aria-label="add" onClick={handleAddClick} >
                            <AddBoxOutlinedIcon />
                        </IconButton>
                    }
                    title={`Add ${props.contract.data['name'] || props.contract.contractName}`}
                /* subheader={} */
                />
                <CardMedia
                    component="img"
                    height="150"
                    image={props.contract.data['image']}
                    alt="Brand image"
                />
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        {props.contract.data['description']}
                    </Typography>
                </CardContent>
                <CardActions disableSpacing>
                    <IconButton aria-label="add to favorites">
                        <FavoriteIcon />
                    </IconButton>
                    <IconButton aria-label="share">
                        <ShareIcon />
                    </IconButton>
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <Typography paragraph>Attributes:</Typography>
                        {Object.keys(props.contract.data).map((key) => {
                            return (
                                <Typography key={key} paragraph>
                                    {`${key}: ${typeof props.contract.data[key] === "object" ? JSON.stringify(props.contract.data[key]) : props.contract.data[key]}`}
                                </Typography>
                            );
                        })}
                    </CardContent>
                </Collapse>
            </Card>
            {addOpen && <AddTokenDialog parentId={props.parentId} contract={props.contract} onClose={() => setAddOpen(false)} />}
        </div>
    );
}
