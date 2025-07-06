main schema based ..right file 


psql -U postgres
node -e "require('bcryptjs').hash('admin123', 10).then(console.log)"


 \c travel_agency;

For Super Admin
CREATE TABLE super_admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'super_admin',
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '[]',
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admins_email_key UNIQUE (email),
    CONSTRAINT unique_email UNIQUE (email)
);

-- Trigger to update `updated_at` column on update
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admins
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    role VARCHAR(50) DEFAULT 'user',
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_id INTEGER,

    CONSTRAINT users_admin_id_fkey
        FOREIGN KEY (admin_id)
        REFERENCES public.admins(id)
        ON DELETE SET NULL
);


-- Trigger to update updated_at timestamp on update
CREATE TRIGGER trigger_update_users 
BEFORE UPDATE ON public.users 
FOR EACH ROW 
EXECUTE FUNCTION update_timestamp();

CREATE TABLE public.otps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_type VARCHAR(20) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_id_user_type UNIQUE (user_id, user_type),
    CONSTRAINT otps_user_type_check CHECK (
        user_type::text = ANY (ARRAY['admin'::VARCHAR, 'user'::VARCHAR]::text[])
    )
);



CREATE TABLE public.permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url VARCHAR(255) UNIQUE,
    icon VARCHAR(50)
);


CREATE TABLE public.bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    flight_id VARCHAR(255) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    amadeus_order_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_id TEXT,
    pnr VARCHAR(10),
    selected_seat VARCHAR(10),
    baggage VARCHAR(10),
    travel_insurance BOOLEAN DEFAULT false,
    refundable_booking BOOLEAN DEFAULT false,
    gstin VARCHAR(15),
    order_id VARCHAR(255),
    signature TEXT,

    CONSTRAINT bookings_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
);


-- http://localhost:5000/api/admin/adminlogin  //post 
-- {
--   "email": "xyz@gmail.com",
--   "password": "admin123"
-- }

-- http://localhost:5000/api/admin/verifyotp   //post 
-- {
--   "email": "xyz@gmail.com",
-- "otp": "828072"
-- }


-- http://localhost:5000/api/auth/forgotpassword  //post 
-- {
--   "email": "xyz.com"
-- }

-- http://localhost:5000/api/admin/resetpassword  ///post
-- {
--   "email": "xyz.com",
--   "otp": "639265",
--   "new_password": "admin123"
-- }

-- http://localhost:5000/api/admin/changepassword    //put 
-- {
--   "old_password": "",
--   "new_password": ""
-- }
-- http://localhost:5000/api/admin/logout //post pass token 

-- http://localhost:5000/api/admin/updateprofile //put  with cookie id in headr tab 
-- Cookie        connect.sid="your sid "  (verifiedotp api genrate coooie is )
 Body (form-data):
 Key	Value	Type
 name	
 email	
 mobile_number	
 profile_image(Select image file)	File



http://localhost:5000/api/admin/users      // get all users
http://localhost:5000/api/admin/check-session
http://localhost:5000/debug-session
http://localhost:5000/api/admin/users/5   // get for get user and put method for update user   
http://localhost:5000/api/admin/users/id/block    //put block user 
http://localhost:5000/api/admin/users/id/unblock
http://localhost:5000/api/admin/blocked-users       // get   getallblock user 




http://localhost:5000/api/admin/dashboard    //get
http://localhost:5000/api/admin/bookings     ///get 
http://localhost:5000/api/admin/bookings/6           //get
http://localhost:5000/api/admin/bookings/6/status     //put