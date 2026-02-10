import React from 'react';
import { useSelector } from 'react-redux';

export default function Event() {
  const { user } = useSelector((state) => state.auth);

  return <div>events</div>;
}
