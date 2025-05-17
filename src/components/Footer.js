'use client';

import moment from 'moment-timezone';

export default function Footer() {

  const currentYear = moment().tz('Asia/Kolkata').format('YYYY');

  return (
    <footer className="bg-white shadow-t mt-8 py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
    
          <div className="text-gray-700 text-sm">
            <p>&#169; {currentYear} Amuda Lab. All Rights Reserved.</p>
          </div>


          <div className="text-gray-500 text-sm">
            <p>Made with ❤️</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
