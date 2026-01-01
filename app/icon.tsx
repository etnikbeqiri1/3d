import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 700,
          color: 'white',
          letterSpacing: -1,
        }}
      >
        9x
      </div>
    ),
    {
      ...size,
    }
  );
}
