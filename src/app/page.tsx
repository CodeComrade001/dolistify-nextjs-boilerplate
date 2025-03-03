"use client";
import React, { useState } from "react";
import LoginStyles from "./styles/logIn.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface signInDetails {
  userName: string;
  password: string;
}

interface signUpDetails {
  userName: string;
  email: string;
  password: string;
  password0: string;
}

export default function HomePage() {
  const [accessType, setAccessType] = useState<"Sign in" | "Sign up">("Sign in");
  const [animationMovement, setAnimationMovement] = useState("")
  const [userSignInDetails, setUserSignInDetails] = useState<signInDetails>({
    userName: "",
    password: "",
  })
  const [userSignUpDetails, setUserSignUpDetails] = useState<signUpDetails>({
    userName: "",
    email: "",
    password: "",
    password0: "",
  })
  const router = useRouter();

  function handleAccessBtn(direction: string, UserAccessType: string) {
    console.log("🚀 ~ handleAccessBtn ~ UserAccessType:", UserAccessType)
    console.log("🚀 ~ handleAccessBtn ~ direction:", direction)
    setAccessType(UserAccessType as "Sign in" | "Sign up")
    setAnimationMovement(direction)
  }

  function handleSignInInputChange(event: React.ChangeEvent<HTMLInputElement>, InputType: "userName" | "password") {

    switch (InputType) {
      case "userName":
        const usernameInput = event.target.value;
        setUserSignInDetails((prevDetails) => ({
          ...prevDetails,
          userName: usernameInput
        }))
        break;
      case "password":
        const passwordInput = event.target.value;
        setUserSignInDetails((prevDetails) => ({
          ...prevDetails,
          password: passwordInput
        }))
        break;
    }
  }

  function handleSignUpInputChange(event: React.ChangeEvent<HTMLInputElement>, inputType: "userName" | "email" | "password" | "password0") {
    switch (inputType) {
      case "userName":
        const usernameInput = event.target.value;
        setUserSignUpDetails((prevDetails) => ({
          ...prevDetails,
          userName: usernameInput
        }))
        break;
      case "email":
        const emailInput = event.target.value;
        setUserSignUpDetails((prevDetails) => ({
          ...prevDetails,
          email: emailInput
        }))
        break;
      case "password":
        const passwordInput = event.target.value;
        setUserSignUpDetails((prevDetails) => ({
          ...prevDetails,
          password: passwordInput
        }))
        break;
      case "password0":
        const password0Input = event.target.value;
        setUserSignUpDetails((prevDetails) => ({
          ...prevDetails,
          password0: password0Input
        }))
        break;
    }
  }

  async function handleSignUpBtn() {
    const { userName, email, password, password0 } = userSignUpDetails;

    if (password === password0) {
      console.log("password is the same")
      if (userName !== "" && email !== "") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userName, email, password }),
        });
        const data = await response.json();
        if (data.success) {
          console.log("Successful but remember the dashboard Route")
          router.push("/");
        } else {
          console.error("Signup failed:", data.error);
        }
      } else {
        console.log("name and email are empty")
      }
    } else {
      console.log("password is different")
    }
  }


  async function handleSignInBtn() {
    try {
      const { userName, password } = userSignInDetails;
      console.log("🚀 ~ handleSignInBtn ~ password:", password)
      console.log("🚀 ~ handleSignInBtn ~ userName:", userName)
      if (userName !== "" && password !== "") {

        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userName, password }),
        });
        const data = await response.json();
        console.log("🚀 ~ handleSignUpBtn ~ data:", data)
        if (data.success) {
          console.log("Successful but remember the dashboard Route")
          router.push("/");
        } else {
          console.error("SignIn failed:", data.error);
        }
      }
      console.log("No input found")
      // You could similarly implement sign-in logic here
    } catch (error: unknown) {
      console.log("Error creating account for user", error);
    }
  }


  return (
    <div className={LoginStyles.root_body}>
      <div className={LoginStyles.container}>
        <div className={LoginStyles.screen}>
          <div className={LoginStyles.screen__content}>
            <div className={LoginStyles.user_access_container}>
              <div className={LoginStyles.user_access_btn_container}>
                <button onClick={() => handleAccessBtn("moveLeft", "Sign in")}>Sign In</button>

                <button onClick={() => handleAccessBtn("moveRight", "Sign up")}>Sign Up</button>
              </div>
              <button
                title="Active Access"
                className={`
                 ${LoginStyles.active_Access} 
                 ${(animationMovement === "moveLeft") ? LoginStyles.moveLeftAnimation : ""}
                 ${(animationMovement === "moveRight") ? LoginStyles.moveRightAnimation : ""}
                 `} >

                {accessType}
              </button>
            </div>
            {
              accessType === "Sign up" ? (
                <form className={LoginStyles.login} >
                  <div className={LoginStyles.Welcome_message}>
                    <h1>Sign up To Dolistify</h1>
                  </div>
                  <div className={LoginStyles.login__field}>
                    <i className={`${LoginStyles.login__icon} fas fa-user`}></i>
                    <input
                      type="text"
                      name={userSignUpDetails.userName}
                      className={LoginStyles.login__input}
                      placeholder="User name"
                      onChange={(e) => handleSignUpInputChange(e, "userName")}
                    />
                  </div>
                  <div className={LoginStyles.login__field}>
                    <i className={`${LoginStyles.login__icon} fas fa-user`}></i>
                    <input
                      type="text"
                      name={userSignUpDetails.email}
                      className={LoginStyles.login__input}
                      placeholder="Email"
                      onChange={(e) => handleSignUpInputChange(e, "email")}
                    />
                  </div>
                  <div className={LoginStyles.login__field}>
                    <i className={`${LoginStyles.login__icon} fas fa-lock`}></i>
                    <input
                      type="password"
                      name={userSignUpDetails.password}
                      className={LoginStyles.login__input}
                      placeholder="Password"
                      onChange={(e) => handleSignUpInputChange(e, "password")}
                    />
                  </div>
                  <div className={LoginStyles.login__field}>
                    <i className={`${LoginStyles.login__icon} fas fa-lock`}></i>
                    <input
                      type="password"
                      name={userSignUpDetails.password0}
                      className={LoginStyles.login__input}
                      placeholder="Confirm Password"
                      onChange={(e) => handleSignUpInputChange(e, "password0")}
                    />
                  </div>
                  <button
                    className={`${LoginStyles.button} ${accessType === "Sign up" ? LoginStyles.sign_up_login_submit : LoginStyles.login__submit}`}
                    onClick={(event) => {
                      event.preventDefault();  // Prevents form from submitting and adding query parameters
                      handleSignUpBtn();
                    }}
                    type="submit"
                  >
                    <span className={LoginStyles.button__text}>Create Account</span>
                    <i className={`${LoginStyles.button__icon} fas fa-chevron-right`}></i>
                  </button>
                  <div className={`${accessType === "Sign up" ? LoginStyles.sign_up_social_login : LoginStyles.social_login}`}>
                    <h3>Sign up via</h3>
                    <div className={LoginStyles.social_icons}>
                      <button
                        title="sign in with google"
                        className={`${LoginStyles.social_login__icon} fab fa-instagram`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                          <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form className={LoginStyles.login}>
                  <div className={LoginStyles.Welcome_message}>
                    <h1>Welcome To Dolistify</h1>
                  </div>
                  <div className={LoginStyles.login__field}>
                    <i className={`${LoginStyles.login__icon} fas fa-user`}></i>
                    <input
                      type="text"
                      name={userSignInDetails.userName}
                      className={LoginStyles.login__input}
                      placeholder="User name / Email"
                      onChange={(e) => handleSignInInputChange(e, "userName")} 
                    />
                  </div>
                  <div className={LoginStyles.login__field}>
                    <i className={`${LoginStyles.login__icon} fas fa-lock`}></i>
                    <input
                      type="password"
                      name={userSignInDetails.password}
                      className={LoginStyles.login__input}
                      placeholder="Password"
                      onChange={(e) => handleSignInInputChange(e, "password")}
                    />
                  </div>
                  <button
                    className={`${LoginStyles.button} ${LoginStyles.login__submit}`}
                    onClick={(event) => {
                      event.preventDefault();  // Prevents form from submitting and adding query parameters
                      handleSignInBtn();
                    }}
                  >
                    <span className={LoginStyles.button__text}>Log In Now</span>
                    <i className={`${LoginStyles.button__icon} fas fa-chevron-right`}></i>
                  </button>
                  <div className={LoginStyles.social_login}>
                    <h3>log in via</h3>
                    <div
                      className={LoginStyles.social_icons}
                    >
                      <button
                        title="sign in with google"
                      >
                        <Link href="#" className={`${LoginStyles.social_login__icon} fab fa-instagram`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                            <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                          </svg>
                        </Link>
                      </button>
                    </div>
                  </div>
                </form>
              )
            }
          </div>
          <div className={LoginStyles.screen__background}>
            <span className={`${LoginStyles.screen__background__shape} ${LoginStyles.screen__background__shape4}`}></span>
            <span className={`${LoginStyles.screen__background__shape} ${LoginStyles.screen__background__shape3}`}></span>
            <span className={`${LoginStyles.screen__background__shape} ${LoginStyles.screen__background__shape2}`}></span>
            <span className={`${LoginStyles.screen__background__shape} ${LoginStyles.screen__background__shape1}`}></span>
          </div>
        </div>
      </div>
    </div>
  );
}
