import { useEffect, useState } from 'react';
import './index.css'

const HangingSpiders = ({ width, height }: any) => {
    // Initial setup
    let baseValue = height;
    let step = 5;
    let minValue = Math.floor(Math.random() * (height - height / 5 + 1)) + height / 5;
    let currentValue = height;
    let decrementing = true;

    const [heightChange, setHeightChange] = useState(0);

    // Function to update the value in an oscillating pattern
    function updateValue() {

        // Check if the current value is decrementing or incrementing
        if (decrementing) {
            if (currentValue > minValue) {
                currentValue -= step;
            } else {
                decrementing = false; // Switch to incrementing
                minValue += step;     // Increase the minimum value for the next cycle
            }
        } else {
            if (currentValue < baseValue) {
                currentValue += step;
            } else {
                decrementing = true; // Switch back to decrementing
            }
        }
        return currentValue
    }


    useEffect(() => {
        // const interval = setInterval(() => {
        //     updateValue();
        //     setHeiVal(currentValue);
        // }, 500);

        // return () => clearInterval(interval);
        let interval: any = null
        setTimeout(() => {
            interval = setInterval(() => {
                setHeightChange(updateValue())
            }, 250);
        }, 250);
        return () => clearInterval(interval);
    }, [])

    return <div className="spider" style={{ width, height: heightChange, display: 'flex', alignItems: 'center', flexDirection: 'column', }}>
        <div className="thread"></div>
        <img
            width={'60%'}
            // height={height}
            src="https://img.icons8.com/fluency-systems-filled/96/spider.png"
            alt="spider"
            style={{}}
        />
    </div>
}

const SpiderConfetti = () => {
    const width = window.innerWidth;
    const maxHeight = window.innerHeight / 2;

    const [spiders, setSpiders] = useState<any>([]);

    useEffect(() => {
        setSpiders(() => {
            const temp = [];
            let sum = 0
            while (sum < width) {
                const tempWidth = Math.floor(Math.random() * (60 - 20 + 1)) + 10;
                const tempHeight = Math.floor(Math.random() * (maxHeight - maxHeight / 2 + 1)) + Math.floor(maxHeight / 2);
                temp.push({ width: tempWidth, height: tempHeight })
                sum += tempWidth
            }

            return [...temp]
        })
    }, [])

    return <div style={{ position: 'fixed', display: 'flex', top: 0 }}>
        {
            spiders.map((spider: any, index: number) => {
                return <HangingSpiders key={index} width={spider.width} height={spider.height} />
            })
        }
    </div>
}

export default SpiderConfetti;