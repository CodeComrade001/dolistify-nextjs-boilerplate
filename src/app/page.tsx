"use client";
import React, { useState } from "react";
import LoginStyles from "./styles/logIn.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignupFormSchema } from "./lib/definition";
import { z } from "zod";


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
  const [signUpText, setSignUpText] = useState("Create Account")
  const [signInText, setSignInText] = useState("Log In Now")
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
  const [formErrors, setFormErrors] = useState<{
    name?: string[];
    email?: string[];
    password?: string[];
  } | null>(null);

  function handleAccessBtn(direction: string, UserAccessType: string) {
    setAccessType(UserAccessType as "Sign in" | "Sign up")
    setAnimationMovement(direction)
  }

  function handleSignInInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
    inputType: "userName" | "password"
  ) {
    if (inputType === "userName") {
      setUserSignInDetails(prev => ({ ...prev, userName: event.target.value }));
    } else {
      setUserSignInDetails(prev => ({ ...prev, password: event.target.value }));
    }
  }

  // Handle sign-up input changes
  function handleSignUpInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
    inputType: "userName" | "email" | "password" | "password0"
  ) {
    setUserSignUpDetails(prev => ({
      ...prev,
      [inputType]: event.target.value,
    }));
  }

  async function handleSignUpBtn() {
    const { userName, email, password, password0 } = userSignUpDetails;
    
    if (password !== password0) {
      return;
    }
    setSignUpText("Loading...")

    try {
      // Validate the form data using your Zod schema.
      SignupFormSchema.parse({
        name: userName,
        email: email,
        password: password,
      });
      // If valid, proceed with the fetch call.
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email, password }),
      });
      const data = await response.json();
      if (data.success) {
        router.push("/Dashboard");
      } else {
        return
      }
    } catch (error) {
      // If the data is invalid, Zod will throw an error which you can catch.
      if (error instanceof z.ZodError) {
        setFormErrors(error.flatten().fieldErrors);
      } else {
        setSignUpText("Failed")
      }
    }
  }


  async function handleSignInBtn() {
    try {
      const { userName, password } = userSignInDetails;
      if (userName !== "" && password !== "") {

        setSignInText('Loading...')
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userName, password }),
        });
        const data = await response.json();
        if (data.success) {
          router.push("/Dashboard");
        } else {
          setSignInText("Incorrect Details")
          return
        }
      }
      setSignInText("Incorrect Details")
      // You could similarly implement sign-in logic here
    } catch {
      setSignInText("Incorrect Details")
      return
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
              accessType === "Sign up"
                ? (
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
                    {formErrors?.name &&
                      formErrors?.name.map((err, idx) => (
                        <p key={`email-error-${idx}`} className={LoginStyles.errorText}>{err}</p>
                      ))}
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
                    {formErrors?.email &&
                      formErrors?.email.map((err, idx) => (
                        <p key={`email-error-${idx}`} className={LoginStyles.errorText}>{err}</p>
                      ))}
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
                    {formErrors?.password && (
                      <div className={LoginStyles.error_list}>
                        <p>Password must:</p>
                        <ul>
                          {formErrors?.password.map((error, idx) => (
                            <li key={idx} className={LoginStyles.error_item}>
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
                      <span className={LoginStyles.button__text}>{signUpText}</span>
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
                      <span className={LoginStyles.button__text}>{signInText}</span>
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
