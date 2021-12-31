import React, { useEffect, useState } from 'react';
import Jimp from 'jimp';

// similar to MIT licensed: https://github.com/AykutSarac/react-jimp/blob/main/src/components/Jimage.js
// not used due to missing composite support
// added svg support indirectly by rendering in a canvas first

export default function WatermarkedImage(props: { src: string, alt: string, height: string, waterMarkImageSrc?: string }) {
    const { src, alt, height } = props;
    const [image, setImage] = useState(src);
    const [loading, setLoading] = useState(true);

    console.log(`WatermarkedImage (src='${src}')`);

    useEffect(() => {
        console.log(`WatermarkedImage useEffect(src)...`);

        async function imgEffect() {
            try {
                var img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = async function () {
                    try {
                        var canvas = document.createElement('CANVAS') as HTMLCanvasElement;
                        var ctx = canvas.getContext('2d');
                        if (ctx) {
                            canvas.height = img.height;
                            canvas.width = img.width;
                            ctx.fillStyle = "white";
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0);
                            var dataUrl = canvas.toDataURL();
                            var loadImage = await Jimp.read(dataUrl);
                            console.log(`WatermarkedImage useEffect(src)...loadImage done size=(${loadImage.getWidth()}x${loadImage.getHeight()})`);

                            if (props.waterMarkImageSrc) {
                                let waterImage = await Jimp.read(props.waterMarkImageSrc);
                                console.log(`WatermarkedImage useEffect(src)...loaded waterImage size=(${waterImage.getWidth()}x${waterImage.getHeight()})`);
                                if (waterImage.getHeight() > loadImage.getHeight()) {
                                    waterImage.resize(Jimp.AUTO, loadImage.getHeight());
                                }
                                if (waterImage.getWidth() > loadImage.getWidth()) {
                                    waterImage.resize(loadImage.getWidth(), Jimp.AUTO);
                                }
                                const wx = loadImage.getWidth() - waterImage.getWidth();
                                const wy = loadImage.getHeight() - waterImage.getHeight();
                                console.log(`WatermarkedImage compositing to (${wx}x${wy})`);

                                loadImage.composite(waterImage, wx, wy);
                                console.log(`WatermarkedImage new image size (${loadImage.getWidth()}x${loadImage.getHeight()})`);
                            }
                            const mime = await loadImage.getBase64Async(Jimp.MIME_JPEG);
                            setLoading(false);
                            setImage(mime);

                            /*
                            console.log(`WatermarkedImage useEffect(src)...loading font '${Jimp.FONT_SANS_32_BLACK}'`);
                            Jimp.loadFont("/open-sans-12-black.fnt").then(async (font) => {
                                console.log(`WatermarkedImage useEffect(src)...loaded font`);
                                loadImage.print(font, 10, 10, "certified dealer");
                            }, (reason) => {
                                console.warn(`WatermarkedImage useEffect load font failed'`, reason);
                            });*/
                        }
                    } catch (e) {
                        console.warn(`WatermarkedImage useEffect(src='${src}') onload got e='${e}'`, e);
                    }
                };
                img.src = src;
            } catch (e) {
                console.warn(`WatermarkedImage useEffect(src='${src}') load got e='${e}'`, e);
            }
        }

        imgEffect();
        return () => setLoading(true);
    }, [src, props.waterMarkImageSrc]);

    return (
        <img
            alt={alt}
            src={image}
            height={height}
            style={loading ? { filter: 'blur(3px)' } : undefined}
        />
    );

}