import { useState, useRef } from "react";
import Education from "./Education";
import Experience from "./Experience";
import axios from "axios";


const AddCandidateModal = ({ closeModal, addCandidate }) => {
  

  const [formData, setFormData] = useState({});
  const [educationData, setEducationData] = useState([]);
  const [sameAddress, setSameAddress] = useState(false);
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState(null);

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


   const handleSubmit = async () => {

  const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const phonePattern = /^[0-9]{10}$/;
  const aadhaarPattern = /^[0-9]{12}$/;
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const uanPattern = /^[0-9]{12}$/;

  if (!formData.firstName) return alert("First Name is required");
  if (!formData.lastName) return alert("Last Name is required");
  if (!emailPattern.test(formData.email || "")) return alert("Invalid Email");
  if (!phonePattern.test(formData.phone || "")) return alert("Invalid Phone");
  if (!aadhaarPattern.test(formData.aadhaar || "")) return alert("Invalid Aadhaar");
  if (!panPattern.test(formData.pan || "")) return alert("Invalid PAN");
  if (formData.uan && !uanPattern.test(formData.uan)) return alert("Invalid UAN");

  try {
    const candidate = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      aadhaar: formData.aadhaar,
      pan: formData.pan,
      uan: formData.uan,
      official_email: formData.officialEmail,

      address_line1: formData.address1,
      address_line2: formData.address2,
      city: formData.city,

      experience: formData.experience,
      source: formData.source,
      skills: formData.skills,
      department: formData.department,

      status: "Pending",

      education: educationData,
      role: formData.role || "employee",
    };

    // await axios.post(
    //   "http://127.0.0.1:8000/api/app1/add/",
    //   candidate
    // );
     const form = new FormData();

Object.keys(candidate).forEach(key => {
  form.append(key, candidate[key]);
});

if (photo) {
  form.append("photo", photo);
}

await axios.post(
  "http://127.0.0.1:8000/api/app1/add/",
  form,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);
    alert("Saved successfully ✅");
    addCandidate();
    closeModal();

  } catch (error) {
    console.error(error);
    alert("Error saving candidate ❌");
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start overflow-y-auto p-6">

      <div className="bg-white p-6 rounded w-[1000px] relative">

        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center border rounded-md bg-gray-100 hover:bg-red-500 hover:text-white"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-6">Add Candidate</h2>
 

        {/* Candidate Details */}
        <h3 className="font-semibold mb-3">Candidate Details</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">

          {/* Email */}
          <div>
            <label className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              placeholder="Enter Email"
              className="border p-2 rounded w-full"
              onChange={handleChange}
            />
          </div>
          
 

          {/* Phone */}
          <div>
            <label className="text-sm font-medium">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              name="phone"
              placeholder="Enter Phone Number"
              maxLength="10"
              className="border p-2 rounded w-full"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })
              }
            />
          </div>

          {/* UAN */}
          <div>
            <label className="text-sm font-medium">UAN Number</label>
            <input
              name="uan"
              placeholder="Enter UAN Number"
              maxLength="12"
              className="border p-2 rounded w-full"
              value={formData.uan || ""}
              onChange={(e) =>
                setFormData({ ...formData, uan: e.target.value.replace(/\D/g, "") })
              }
            />
          </div>

          {/* Aadhaar */}
          <div>
            <label className="text-sm font-medium">
              Aadhaar Number <span className="text-red-500">*</span>
            </label>
            <input
              name="aadhaar"
              placeholder="Enter Aadhaar Number"
              maxLength="12"
              className="border p-2 rounded w-full"
              value={formData.aadhaar || ""}
              onChange={(e) =>
                setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, "") })
              }
            />
          </div>
          

          {/* PAN */}
          <div>
            <label className="text-sm font-medium">
              PAN Number <span className="text-red-500">*</span>
            </label>
            <input
              name="pan"
              placeholder="ABCDE1234F"
              maxLength="10"
              className="border p-2 rounded w-full uppercase"
              value={formData.pan || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                })
              }
            />
          </div>
             <div className="relative">
  <label className="text-sm font-medium">
    Password <span className="text-red-500">*</span>
  </label>

  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Enter Password"
    className="border p-2 rounded w-full pr-10"
    onChange={handleChange}
  />

  {/* 👁️ Eye Button */}
  <span
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-9 cursor-pointer"
  >
    {showPassword ? "🙈" : "👁️"}
  </span>
</div>
<div>
  <label className="text-sm font-medium">Role</label>
  <select
    name="role"
    className="border p-2 rounded w-full"
    onChange={handleChange}
  >
    <option value="employee">Employee</option>
    <option value="admin">Admin</option>
  </select>
</div>

          {/* Photo Upload */}
          <div className="border rounded p-3 col-span-3">
            <label className="font-medium block mb-2">Photo</label>
            <p className="text-sm mb-2">Upload from</p>

            <div className="flex gap-3 mb-2">
              <button type="button" onClick={openFilePicker} className="bg-gray-200 px-3 py-1 rounded">
                Desktop
              </button>

              <button type="button" onClick={openFilePicker} className="bg-gray-200 px-3 py-1 rounded">
                Others
              </button>
            </div>

            {/* <input type="file" ref={fileInputRef} className="hidden" /> */}
            <input
  type="file"
  ref={fileInputRef}
  className="hidden"
  onChange={(e) => setPhoto(e.target.files[0])}
/>

            <p className="text-xs text-gray-400">Files supported: JPG, PNG, GIF, JPEG</p>
            <p className="text-xs text-gray-400">Max size is 5 MB</p>
          </div>

          {/* First Name */}
          <div>
            <label className="text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              name="firstName"
              placeholder="Enter First Name"
              className="border p-2 rounded w-full"
              onChange={handleChange}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              name="lastName"
              placeholder="Enter Last Name"
              className="border p-2 rounded w-full"
              onChange={handleChange}
            />
          </div>

          {/* Official Email */}
          <div>
            <label className="text-sm font-medium">Official Email</label>
            <input
              name="officialEmail"
              placeholder="Enter Official Email"
              className="border p-2 rounded w-full"
              onChange={handleChange}
            />
          </div>

        </div>

        {/* Address */}
        <h3 className="font-semibold mb-3">Address Details</h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <input name="address1" placeholder="Address Line 1" className="border p-2 rounded" onChange={handleChange} />
<input name="address2" placeholder="Address Line 2" className="border p-2 rounded" onChange={handleChange} />
<input name="city" placeholder="City" className="border p-2 rounded" onChange={handleChange} />
        </div>

        <label className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={sameAddress} onChange={() => setSameAddress(!sameAddress)}/>
          Same as Present Address
        </label>

        {/* Professional */}
        <h3 className="font-semibold mb-3">Professional Details</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
         <input name="experience" placeholder="Experience (e.g., 2 years)" className="border p-2 rounded" onChange={handleChange} />

          <select name="source" className="border p-2 rounded" onChange={handleChange}>
            <option value="">Select Source</option>
            <option>Referral</option>
            <option>LinkedIn</option>
          </select>

          <input name="skills" placeholder="Skill Set (e.g., Python, React)" className="border p-2 rounded" onChange={handleChange} />

          <select name="department" className="border p-2 rounded" onChange={handleChange}>
            <option>Select Department</option>
            <option>HR</option>
            <option>IT</option>
          </select>
        </div>

        {/* Education */}
        <Education setEducationData={setEducationData} />

        {/* Experience */}
        <Experience setExperienceData={() => {}} />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">

         
          <button type="button" onClick={closeModal} className="bg-gray-400 text-white px-4 py-2 rounded">
  Cancel
</button>

<button type="button" className="bg-blue-600 text-white px-4 py-2 rounded">
  Save Draft
</button>

<button type="button" onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
  Submit
</button>

<button type="button" className="bg-purple-600 text-white px-4 py-2 rounded">
  Submit & New
</button>

        </div>

      </div>
    </div>
  );
};

export default AddCandidateModal;