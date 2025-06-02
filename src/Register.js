import React, { useState } from 'react';
import './Register.css';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBOlJm1W4fgVZpqepg9CQukjFIL_iad-qI",
  authDomain: "skillhub-f62b1.firebaseapp.com",
  projectId: "skillhub-f62b1",
  storageBucket: "skillhub-f62b1.appspot.com",
  messagingSenderId: "941382961108",
  appId: "1:941382961108:web:b797bc2173fabf2df37841",
  measurementId: "G-EY4P3EVDWJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    course: '',
    document: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'document') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const storageRef = ref(storage, `documents/${user.uid}/${formData.document.name}`);
      await uploadBytes(storageRef, formData.document);
      const documentURL = await getDownloadURL(storageRef);

      await setDoc(doc(db, 'registrations', user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        course: formData.course,
        documentURL: documentURL,
        timestamp: new Date()
      });

      alert('Registration successful! Please check your email to verify your account.');
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Registration failed: ' + error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Register for a Course</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <select name="course" value={formData.course} onChange={handleChange} required>
          <option value="">Select a Course</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Welding">Welding</option>
          <option value="IT & Networking">IT & Networking</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Construction">Construction</option>
          <option value="Cosmetology">Cosmetology</option>
        </select>
        <input type="file" name="document" onChange={handleChange} accept="application/pdf,image/*" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
