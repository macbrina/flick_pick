import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchAllAvatars } from "@/app/_lib/data-service";

const AvatarSelectionPage = ({ user }) => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  useEffect(() => {
    const getAvatars = async () => {
      try {
        const images = await fetchAllAvatars();
        setAvatars(images);
      } catch (error) {
        console.error("Error fetching avatars:", error);
      }
    };

    getAvatars();
  }, []);

  useEffect(() => {
    // Set default selected avatar if user.avatarUrl exists
    if (user.avatarUrl) {
      setSelectedAvatar(user.avatarUrl);
    }
  }, [user.avatarUrl]);

  const handleSelectAvatar = (url) => {
    setSelectedAvatar(url);
  };

  const handleSaveAvatar = async () => {
    console.log("Selected Avatar URL:", selectedAvatar);
    if (selectedAvatar) {
      try {
        await saveUserAvatar(user.id, selectedAvatar);
        console.log("Avatar saved successfully");
      } catch (error) {
        console.error("Error saving avatar:", error);
      }
    } else {
      console.error("No avatar selected");
    }
  };

  return (
    <div>
      <h1>Select Your Avatar</h1>
      <div>
        <Image
          src={selectedAvatar || "/path/to/default/avatar.png"} // Placeholder if no avatar is selected
          alt="Selected Avatar"
          width={150}
          height={150}
          layout="fixed"
        />
      </div>
      <div className="avatar-grid">
        {avatars.map((avatar) => (
          <div
            key={avatar.name}
            onClick={() => handleSelectAvatar(avatar.url)}
            style={{ cursor: "pointer" }}
          >
            <Image
              src={avatar.url}
              alt={avatar.name}
              width={100}
              height={100}
              layout="fixed"
            />
          </div>
        ))}
      </div>
      <button onClick={handleSaveAvatar}>Save Image</button>
    </div>
  );
};

export default AvatarSelectionPage;
