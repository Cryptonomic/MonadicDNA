'use client';

import * as React from 'react';

interface IModal {
    open: boolean;
    children: React.ReactElement;
    onClose?: React.MouseEventHandler<HTMLDivElement>;
};

const Modal = (props: IModal) => {

    if(!props.open) {
        return null;
    };

    return (
        <div
            onClick={props.onClose}
            className='fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center'
       >
            <div
                onClick={(e) => e.stopPropagation()}
                className='bg-white'
            >
                {props.children}
            </div>
        </div>
    );
}

export default Modal;