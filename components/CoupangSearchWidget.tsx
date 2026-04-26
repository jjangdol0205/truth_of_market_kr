"use client";

import React from 'react';

export default function CoupangSearchWidget() {
    return (
        <div className="w-full flex justify-center my-4 overflow-hidden rounded-lg shadow-sm border border-zinc-800/50 hover:border-zinc-700 transition-colors bg-[#0a0a0a]">
            <iframe 
                src="https://coupa.ng/cmAdDy" 
                width="100%" 
                height="75" 
                frameBorder="0" 
                scrolling="no" 
                referrerPolicy="unsafe-url"
                className="w-full max-w-4xl"
                title="Coupang Search"
            ></iframe>
        </div>
    );
}
