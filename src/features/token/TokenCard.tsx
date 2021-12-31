import * as React from 'react';

import { Link, } from 'react-router-dom';

import { RootState } from '../../app/store'
import { TokenData, loadTokenDataFor } from '../wallet/walletSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks'

import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// import { grey } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CardActionArea } from '@mui/material';

import WatermarkedImage from '../imageproc/WatermarkedImage';
import { safeDomainNameFromUrl } from '../../utils';


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

export default function TokenCard(props: { tokenId: string, to?: string }) {
    const [expanded, setExpanded] = React.useState(false);
    const [data, setData] = React.useState<TokenData | undefined>(undefined);
    // const contractsData = useAppSelector((state: RootState) => state.wallet.contractsData);
    const tokensData = useAppSelector((state: RootState) => state.wallet.tokensData);
    const [avatarImage, setAvatarImage] = React.useState<string | undefined>();
    const [mainImage, setMainImage] = React.useState<string | undefined>();
    const [parentName, setParentName] = React.useState<string | undefined>();

    const dispatch = useAppDispatch();

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    React.useEffect(() => {
        if (!data) {
            if (props.tokenId && tokensData) {
                if (props.tokenId in tokensData) {
                    setData(tokensData[props.tokenId]);
                } else {
                    // trigger getting the data
                    dispatch(loadTokenDataFor({ tokenId: props.tokenId }));
                }
            }
        } else {
            if (data !== tokensData[props.tokenId]) {
                console.log(`TokenCard tokensData for tokenId=${props.tokenId} changed`)
                setData(tokensData[props.tokenId]);
            }
        }
    }, [dispatch, data, props.tokenId, tokensData]);

    React.useEffect(() => {
        // determine Avatar = brand image.
        // we use the upmost (grand-grand-... parent) image
        if (data && data.parentId) {
            let avatarUrl: string | undefined = undefined;
            let mainUrl: string | undefined = data.data?.['image'];
            let rootParentTokenId: string | undefined = data.parentId;
            let parentToken: TokenData | undefined = tokensData[rootParentTokenId];
            let aParentName: string | undefined = undefined;
            while (parentToken) {
                if (parentToken.data && 'image' in parentToken.data) {
                    avatarUrl = parentToken.data['image'];
                    if (!mainUrl || mainUrl.length === 0) {
                        mainUrl = avatarUrl;
                    }
                }
                if (!aParentName && parentToken.data) {
                    aParentName = parentToken.data['name'];
                }
                rootParentTokenId = parentToken.parentId;
                parentToken = rootParentTokenId ? tokensData[rootParentTokenId] : undefined;
            };
            setParentName(aParentName);
            setAvatarImage(avatarUrl);
            setMainImage(mainUrl);
        } else if (data) { // no parent id -> root token
            setAvatarImage("https://genuines.parts/static/app/1/avatarImage.png");
            setMainImage(data.data?.['image'] || "https://genuines.parts/static/app/1/mainImage.png");
            setParentName(safeDomainNameFromUrl(data.data?.["external_link"] || ""));
        }
    }, [data, tokensData]);

    if (!data) {
        return (
            <Card sx={{ maxWidth: 345 }}>
                <CardHeader title={`Token Id=${props.tokenId.split('-')[1]}`} />
                <CardMedia
                    component="img"
                    height="100"
                    image='/loading.png'
                    alt="Loading..."
                />
            </Card>
        );
    }

    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardActionArea component={props.to ? Link : "div"} to={props.to}>
                <CardHeader
                    avatar={
                        <Avatar variant="square" sx={{}} aria-label="brand" src={avatarImage || 'https://foo' /* todo genuines logo */} alt={'g'}>
                        </Avatar>
                    }
                    action={
                        <IconButton aria-label="settings">
                            <MoreVertIcon />
                        </IconButton>
                    }
                    title={data.data?.['name'] || "no name yet?"}
                    subheader={parentName}
                />
                {data.data?.['id'] && <CardMedia
                    component="img"
                    height="150"
                    sx={{ objectFit: "contain" }}
                    image={mainImage}
                    alt="main image"
                />}
                {data.data?.['id'] === undefined && <CardContent sx={{ justifyContent: "center", alignItems: "center", display: "flex" }} >
                    <WatermarkedImage src={mainImage || ''} alt="watermarked image" waterMarkImageSrc={data.data?.['id'] === undefined && data.data?.['rs'] === "authorized dealer" ? "/authorized_dealer.png" : undefined} height="150" />
                </CardContent>}
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        {data.data?.['description']}
                    </Typography>
                </CardContent>
            </CardActionArea>
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
                    {Array.isArray(data.data?.['attributes']) && (data.data['attributes'] as any[]).map((attr: any) => {
                        return (
                            <Typography key={JSON.stringify(attr)} paragraph>
                                {`${attr['trait_type']}: ${attr['value']}`}
                            </Typography>
                        );
                    })}
                    <Typography paragraph>Debug info:</Typography>
                    <Typography paragraph>{`Id: ${data.data?.['id']}`}</Typography>
                    <Typography paragraph>{`Parent Id: ${data.parentId}`}</Typography>
                    <Typography paragraph>{`AvatarImage: ${avatarImage}`}</Typography>
                    <Typography paragraph>{`MainImage: ${mainImage}`}</Typography>
                    <Typography paragraph>{`Parent name: ${parentName}`}</Typography>
                    <Typography paragraph>{`data.data: ${JSON.stringify(data.data)}`}</Typography>
                </CardContent>
            </Collapse>
        </Card >
    );
}
