"use client";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function RedirectTimer({ time = 3, hidden = false, href="/", message="Redirecting in... " }): React.ReactElement {
  const [ remainingTime, setRemainingTime ] = useState(time);
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (remainingTime > 0) {
      timeoutId = setTimeout(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
    }
    if (remainingTime === 0) {
      if (timeoutId) clearTimeout(timeoutId);
      redirect(href);
    }
    return () => { if (timeoutId) clearTimeout(timeoutId) };
  }, [remainingTime, href]);

  return <>
    { !hidden && <p>{ message }{ remainingTime }</p> }
  </>
}