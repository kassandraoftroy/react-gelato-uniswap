import React from 'react';
import './nav.less';

const StepNavigation = (props) => {
    const dots = [];
    for (let i = 1; i <= props.totalSteps; i += 1) {
        const isActive = props.currentStep === i;
        let icon;
        if (i == 1) {
            icon ='💳 ';
        } else if (i==2) {
            icon=' 🔁';
        } else {
            icon='🍦';
        }
        dots.push((
            <span
                key={`step-${i}`}
                className={`center dot ${isActive ? 'active' : ''}`}
                onClick={() => props.goToStep(i)}
            >{icon}</span>
        ));
    }

    return (
        <div className={'nav'}>{dots}</div>
    );
};

export default StepNavigation;