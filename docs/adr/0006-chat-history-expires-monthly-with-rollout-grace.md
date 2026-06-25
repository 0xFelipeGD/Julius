# Chat history expires monthly with rollout grace

Julius 2.0 will clear chat history monthly by assigning chat messages an expiration timestamp at the first day of the next month in the user's timezone. Existing messages should not be deleted immediately on rollout; they will receive a grace expiration on the next month boundary after deployment, so active users are not surprised by same-day history loss.
