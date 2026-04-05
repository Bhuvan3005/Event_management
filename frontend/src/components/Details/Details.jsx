    import "./Details.css";
    import { useState , useEffect} from "react";
    import { useNavigate, useParams } from "react-router-dom";
    import dateLogo from "../../assets/calendar.png";
    import timeLogo from "../../assets/clock.png";
    import venueLogo from "../../assets/location.png";
    
    import { API_URL } from "../../config.js";
    let Details= (props)=>{
        const [selected, setSelected] = useState(null)
        const {id}=useParams();
        const navigate = useNavigate();

        // Details State
        const [reviews, setReviews] = useState([]);
        const [reviewText, setReviewText] = useState("");
        const [rating, setRating] = useState(5);

        // Coupon State
        const [couponCode, setCouponCode] = useState("");
        const [discountValue, setDiscountValue] = useState(0);
        const [couponId, setCouponId] = useState(null);

        const pricePerTicket = selected?.price || 0;
        const serviceRate = 0.10; // 10%

        const [quantity, setQuantity] = useState(1);

        const increaseQty = () => {
            setQuantity(prev => prev + 1);
        };

        const decreaseQty = () => {
            if (quantity > 1) {
                setQuantity(prev => prev - 1);
            }
        };

        const subtotal = quantity * pricePerTicket;
        const serviceFee = subtotal * serviceRate;
        const totalBeforeDiscount = subtotal + serviceFee;
        const total = Math.max(totalBeforeDiscount - discountValue, 0);

        const validateCoupon = async () => {
          if (!couponCode) return;
          try {
            const res = await fetch(`${API_URL}/api/coupons/validate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: couponCode, totalAmount: totalBeforeDiscount })
            });
            const data = await res.json();
            if (res.ok) {
              setDiscountValue(data.discountValue);
              setCouponId(data.couponId);
              alert(data.message);
            } else {
              setDiscountValue(0);
              setCouponId(null);
              alert(data.error);
            }
          } catch (err) {
            console.error(err);
          }
        };

        const handleBooking = async () => {
          try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) {
              alert("Please login to book tickets");
              navigate("/login"); 
              return;
            }

            // Using relative URL or localhost for now as Render URL might be stale
            const res = await fetch(`${API_URL}/api/bookings`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: user.id,
                eventId: selected.event_id,
                showtimeId: selected.showtime?.[0]?.showtime_id,
                totalAmount: total,
                quantity: quantity,
                couponId: couponId
              }),
            });

            if (res.ok) {
              alert("Booking successful! Seats have been assigned.");
              navigate("/profile");
            } else {
              const data = await res.json();
              alert(data.error || "Booking failed");
            }
          } catch (err) {
            console.log(err);
            alert("An error occurred during booking");
          }
        };

        const fetchReviews = async () => {
          try {
            const res = await fetch(`${API_URL}/api/reviews/${id}`);
            const data = await res.json();
            if (res.ok) setReviews(data);
          } catch (err) {
            console.error(err);
          }
        };

        const handleReviewSubmit = async (e) => {
          e.preventDefault();
          const user = JSON.parse(localStorage.getItem("user"));
          if (!user) {
            alert("Please login to submit a review");
            return;
          }
          try {
            const res = await fetch(`${API_URL}/api/reviews`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event_id: id, user_id: user.id, rating, review_text: reviewText })
            });
            if (res.ok) {
              alert("Review posted!");
              setReviewText("");
              fetchReviews();
            } else {
              alert("Failed to post review");
            }
          } catch (err) {
            console.error(err);
          }
        };

        useEffect(() => {
          const fetchEvent = async () => {
            try {
              const res = await fetch(`${API_URL}/api/events/${id}`);
              const data = await res.json();
              setSelected(data);
            } catch (err) {
              console.log(err);
            }
          };
          fetchEvent();
          fetchReviews();
        }, [id]);
        if (!selected) {
            return <div>Loading...</div>;
        }
        return(
            <div id="details">
                
                <header>
                    <div id="back">
                        <span
    style={{ cursor: "pointer" }}
    onClick={() => navigate(-1)}
    >
    ⬅️ Back To Events
    </span>
                    </div>
                </header>

                <div id="mid">
                        <div id="detailed-card">
                            <div id="img-card">
                                <img id="image" src={selected.url} alt="" />
                            </div>
                            <div id="event-details">
                                    <h1>{selected.title}</h1>
                                    <p>{selected.description}</p>
                                    <div className="event-logos">
                                            <div className="logo-row">
                                                <img src={dateLogo} alt="Date: " className="logo" />
                                                <span>{selected.date}</span>
                                            </div>
                                            <div className="logo-row">
                                                <img src={timeLogo} alt="Time: " className="logo" />
                                                <span>{selected.time}</span>
                                            </div>
                                            <div className="logo-row">
                                                <img src={venueLogo} alt="Venue: " className="logo" />
                                                <span>{selected.location}</span>
                                            </div>
                                            {/* <a href="reg.html">Click here to register</a> */}
                                                        <div id="ticket-box">
                                                            <div id="counterTicket">
                                                                    <h3>Select Tickets</h3>

                                                                    <div id="Counter">

                                                                        <div id="ticket-row">
                                                                            <div id="ticket-info">
                                                                                <span className="ticket-title">General Admission</span>
                                                                                <span className="ticket-price">Rs. {pricePerTicket} per ticket</span>
                                                                            </div>

                                                                            <div id="ticket-controls">
                                                                                <button className="qty-btn"
                                                                                onClick={decreaseQty}
                                                                                >−</button>
                                                                                <span id="quantity">{quantity}</span>
                                                                                <button className="qty-btn"
                                                                                onClick={increaseQty}
                                                                                >+</button>
                                                                            </div>
                                                                        </div>

                                                                    </div>

                                                                    <p id="availability">300 tickets available</p>
                                                            </div>

                                                            <div id="bill">

                                                                    <div className="bill-row">
                                                                        <span>
                                                                            Subtotal ({quantity} ticket{quantity > 1 ? "s" : ""})
                                                                        </span>
                                                                        <span>
                                                                            Rs. {subtotal.toFixed(2)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="bill-row">
                                                                        <span>Service Fee</span>
                                                                        <span>
                                                                            Rs. {serviceFee.toFixed(2)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="coupon-section" style={{ display: 'flex', marginTop: '10px' }}>
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder="Coupon Code" 
                                                                            value={couponCode} 
                                                                            onChange={(e) => setCouponCode(e.target.value)} 
                                                                            style={{ flex: 1, padding: '5px' }}
                                                                        />
                                                                        <button onClick={validateCoupon} style={{ padding: '5px 10px', marginLeft: '5px', cursor: 'pointer' }}>Apply</button>
                                                                    </div>

                                                                    {discountValue > 0 && (
                                                                      <div className="bill-row" style={{ color: 'green', marginTop: '10px' }}>
                                                                          <span>Discount</span>
                                                                          <span>- Rs. {discountValue.toFixed(2)}</span>
                                                                      </div>
                                                                    )}

                                                                    <hr />

                                                                    <div className="bill-total">
                                                                        <span>Total</span>
                                                                        <span id="total-price">
                                                                            Rs. {total.toFixed(2)}
                                                                        </span>
                                                                    </div>

                                                                    <button id="checkout-btn" onClick={handleBooking}>
                                                                        Book Now
                                                                    </button>

                                                            </div>

                                                        </div>
                                    </div>
                            </div>
                        </div>

                        {/* REVIEWS SECTION */}
                        <div id="reviews-section" style={{ marginTop: '40px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            <h2>Reviews</h2>
                            <div className="review-list" style={{ marginBottom: '20px' }}>
                              {reviews.length === 0 ? <p>No reviews yet. Be the first!</p> : (
                                reviews.map(r => (
                                  <div key={r.review_id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                                    <strong>{r.users?.name || "Anonymous"}</strong> 
                                    <span style={{ color: 'gold', marginLeft: '10px' }}>{"⭐".repeat(r.rating)}</span>
                                    <p style={{ margin: '5px 0' }}>{r.review_text}</p>
                                  </div>
                                ))
                              )}
                            </div>

                            <h3>Leave a Review</h3>
                            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: '5px', width: '100px' }}>
                                <option value={5}>5 Stars</option>
                                <option value={4}>4 Stars</option>
                                <option value={3}>3 Stars</option>
                                <option value={2}>2 Stars</option>
                                <option value={1}>1 Star</option>
                              </select>
                              <textarea 
                                rows="3" 
                                placeholder="Write your review here..." 
                                value={reviewText} 
                                onChange={(e) => setReviewText(e.target.value)} 
                                required
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                              ></textarea>
                              <button type="submit" style={{ alignSelf: 'flex-start', padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Review</button>
                            </form>
                        </div>

                </div>
            </div>

        )
    }
    export default Details