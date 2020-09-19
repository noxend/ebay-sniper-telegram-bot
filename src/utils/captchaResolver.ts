import path from 'path';
import jimp from 'jimp';
import pixelmatch from 'pixelmatch';
import { promises as fs } from 'fs';
import { Page } from 'puppeteer';
import { cv } from 'opencv-wasm';

const originalImgPath = path.join(
  __dirname,
  '..',
  '..',
  'temp',
  'original.png'
);
const captchaImgPath = path.join(__dirname, '..', '..', 'temp', 'captcha.png');
const puzzleImgPath = path.join(__dirname, '..', '..', 'temp', 'puzzle.png');
const diffImgPath = path.join(__dirname, '..', '..', 'temp', 'diff.png');

export const saveSliderCaptchaImages = async (page: Page) => {
  const buttonSelector = '#captcha-box > div > div.geetest_btn';
  const canvasSelector = '.geetest_canvas_img canvas';

  await page.waitForSelector(buttonSelector);
  await page.waitFor(1000);

  await page.click(buttonSelector);

  await page.waitForSelector(canvasSelector, { visible: true });
  await page.waitFor(1000);
  const images = await page.$$eval(canvasSelector, (canvases) => {
    return (<HTMLCanvasElement[]>canvases).map((canvas) =>
      canvas.toDataURL().replace(/^data:image\/png;base64,/, '')
    );
  });

  await fs.writeFile(captchaImgPath, images[0], 'base64');
  await fs.writeFile(puzzleImgPath, images[1], 'base64');
  await fs.writeFile(originalImgPath, images[2], 'base64');
};

export const saveDiffImage = async () => {
  const originalImage = await jimp.read(originalImgPath);
  const captchaImage = await jimp.read(captchaImgPath);

  const { width, height } = originalImage.bitmap;
  const diffImage = new jimp(width, height);

  const diffOptions = { includeAA: true, threshold: 0.1 };

  pixelmatch(
    originalImage.bitmap.data,
    captchaImage.bitmap.data,
    diffImage.bitmap.data,
    width,
    height,
    diffOptions
  );

  diffImage.write(diffImgPath);
};

export const findDiffPosition = async () => {
  const srcImage = await jimp.read(diffImgPath);
  const src = cv.matFromImageData(srcImage.bitmap);

  const dst = new cv.Mat();
  const kernel = cv.Mat.ones(5, 5, cv.CV_8UC1);
  const anchor = new cv.Point(-1, -1);

  cv.threshold(src, dst, 127, 255, cv.THRESH_BINARY);
  cv.erode(dst, dst, kernel, anchor, 1);
  cv.dilate(dst, dst, kernel, anchor, 1);
  cv.erode(dst, dst, kernel, anchor, 1);
  cv.dilate(dst, dst, kernel, anchor, 1);

  cv.cvtColor(dst, dst, cv.COLOR_BGR2GRAY);
  cv.threshold(dst, dst, 150, 255, cv.THRESH_BINARY_INV);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    dst,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  let contour = contours.get(0);
  let moment = cv.moments(contour);

  return [
    Math.floor(moment.m10 / moment.m00),
    Math.floor(moment.m01 / moment.m00),
  ];
};

export const findPuzzlePosition = async () => {
  let srcPuzzleImage = await jimp.read(puzzleImgPath);
  let srcPuzzle = cv.matFromImageData(srcPuzzleImage.bitmap);
  let dstPuzzle = new cv.Mat();

  cv.cvtColor(srcPuzzle, srcPuzzle, cv.COLOR_BGR2GRAY);
  cv.threshold(srcPuzzle, dstPuzzle, 127, 255, cv.THRESH_BINARY);

  let kernel = cv.Mat.ones(5, 5, cv.CV_8UC1);
  let anchor = new cv.Point(-1, -1);
  cv.dilate(dstPuzzle, dstPuzzle, kernel, anchor, 1);
  cv.erode(dstPuzzle, dstPuzzle, kernel, anchor, 1);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    dstPuzzle,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  let contour = contours.get(0);
  let moment = cv.moments(contour);

  return [
    Math.floor(moment.m10 / moment.m00),
    Math.floor(moment.m01 / moment.m00),
  ];
};

export const captchaResolver = async (page: Page) => {
  await saveSliderCaptchaImages(page);
  await saveDiffImage();
  const [cx, cy] = await findDiffPosition();

  const sliderHandle = await page.$('.geetest_slider_button');
  const handle = await sliderHandle?.boundingBox();

  if (handle?.x && handle?.y) {
    let xPosition = handle.x + handle.width / 2;
    let yPosition = handle.y + handle.height / 2;
    await page.mouse.move(xPosition, yPosition);
    await page.mouse.down();

    let [cxPuzzle, cyPuzzle] = await findPuzzlePosition();

    await page.waitFor(1000);

    xPosition = xPosition + cx - cxPuzzle;
    yPosition = handle.y + handle.height / 2;
    await page.mouse.move(xPosition, yPosition, { steps: 32 });
    await page.waitFor(1300);
    await page.mouse.up();
  }
};
