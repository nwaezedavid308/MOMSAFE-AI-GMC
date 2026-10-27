import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, MessageSquare, Heart, Sparkles, Plus, Check, X,
  Send, CheckCircle2, ShieldCheck, Search, Filter, 
  Tag, Baby, Stethoscope, Share2, HelpCircle, EyeOff, Lock, User
} from "lucide-react";

interface CommunityReply {
  id: string;
  author: string;
  role: "Mother" | "GMC Clinician" | "TBA Midwife";
  badgeText?: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface CommunityPost {
  id: string;
  author: string;
  isAnonymous: boolean;
  community: string;
  group: "All Nigerian Mothers" | "1st Trimester" | "2nd Trimester" | "3rd Trimester" | "Postpartum & Omugwo";
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  replies: CommunityReply[];
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    author: "Mama Chiamaka",
    isAnonymous: false,
    community: "Umuchigbo, Enugu East",
    group: "Postpartum & Omugwo",
    title: "Best recipe for Ji Mmiri Oku (Yam Pepper Soup) after delivery?",
    content: "My mother-in-law is arriving for Omugwo tomorrow! Which traditional spices like Uda and Uziza help shrink the uterus best without being too harsh on baby's tummy while breastfeeding?",
    timestamp: "2 hours ago",
    likes: 24,
    replies: [
      {
        id: "rep-1",
        author: "Dr. K. Obi",
        role: "GMC Clinician",
        badgeText: "GMC Medical Director",
        text: "Ji Mmiri Oku is fantastic for postpartum hydration and lochia expulsion! Keep the red chili pepper gentle so you stay well hydrated without stomach upset.",
        timestamp: "1 hour ago",
        likes: 18
      },
      {
        id: "rep-2",
        author: "Ngozi (Mama Twins)",
        role: "Mother",
        text: "Make sure you boil the Uda well and remove the black seeds inside so it doesn't taste too bitter! Enjoy your Omugwo mama.",
        timestamp: "45 mins ago",
        likes: 7
      }
    ]
  },
  {
    id: "post-2",
    author: "Anonymous Sister",
    isAnonymous: true,
    community: "Iji-Nike",
    group: "3rd Trimester",
    title: "Packing the GMC delivery bag - what are the strict essentials?",
    content: "I am 36 weeks now. I have packed 3 clean wrappers, baby clothes, and maternity pads. Does Googwill Medical Centre require baby oil or is chlorhexidine gel provided for cord care?",
    timestamp: "4 hours ago",
    likes: 19,
    replies: [
      {
        id: "rep-3",
        author: "Nurse Eunice",
        role: "TBA Midwife",
        badgeText: "Lead Community TBA",
        text: "GMC provides sterile delivery packs and 7.1% Chlorhexidine gel for the baby's cord! Just bring your green antenatal card, baby shawl, sanitary pads, and clean clothes.",
        timestamp: "3 hours ago",
        likes: 15
      }
    ]
  },
  {
    id: "post-3",
    author: "Mama Ifeoma",
    isAnonymous: false,
    community: "Abakpa / Umuchigbo",
    group: "1st Trimester",
    title: "Dealing with intense morning sickness (Agbọ) and tiredness",
    content: "Week 9 has been tough with nausea every morning. The smell of frying food makes me dizzy. How did other Nigerian mothers cope during their first trimester?",
    timestamp: "Yesterday",
    likes: 31,
    replies: [
      {
        id: "rep-4",
        author: "Blessing O.",
        role: "Mother",
        text: "Sipping cold water with a slice of lemon first thing in the morning helped me a lot! Also eating small boiled yam or crackers before getting out of bed.",
        timestamp: "Yesterday",
        likes: 12
      }
    ]
  },
  {
    id: "post-4",
    author: "Adaobi N.",
    isAnonymous: false,
    community: "Emene Corridor",
    group: "2nd Trimester",
    title: "Finally felt the baby flutter (Quickening) at 19 weeks!",
    content: "I thought it was just stomach gas at first, but yesterday while lying quietly on my left side, I felt little popcorn taps! It made me so emotional. God is wonderful!",
    timestamp: "2 days ago",
    likes: 45,
    replies: [
      {
        id: "rep-5",
        author: "Sister Kemi",
        role: "Mother",
        text: "Congratulations Ada! That is quickening! By 24 weeks those gentle taps will turn into full kicks. Enjoy the golden trimester!",
        timestamp: "2 days ago",
        likes: 9
      }
    ]
  }
];

interface NigerianMothersCommunityProps {
  currentUser?: { name: string; role: string; community?: string } | null;
}

export default function NigerianMothersCommunity({ currentUser }: NigerianMothersCommunityProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [selectedGroup, setSelectedGroup] = useState<string>("All Groups");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);

  // New Post Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newGroup, setNewGroup] = useState<CommunityPost["group"]>("All Nigerian Mothers");
  const [postAsAnonymous, setPostAsAnonymous] = useState(false);

  // Reply Drafts map (postId -> text)
  const [replyDrafts, setReplyDrafts] = useState<{ [postId: string]: string }>({});

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = p.hasLiked;
          return {
            ...p,
            likes: hasLiked ? p.likes - 1 : p.likes + 1,
            hasLiked: !hasLiked
          };
        }
        return p;
      })
    );
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Math.random()}`,
      author: postAsAnonymous ? "Anonymous Sister" : currentUser?.name || "Nigerian Mama",
      isAnonymous: postAsAnonymous,
      community: currentUser?.community || "Umuchigbo, Enugu East",
      group: newGroup,
      title: newTitle,
      content: newContent,
      timestamp: "Just now",
      likes: 1,
      hasLiked: true,
      replies: []
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewTitle("");
    setNewContent("");
    setShowNewPostModal(false);
  };

  const handleAddReply = (postId: string) => {
    const draft = replyDrafts[postId];
    if (!draft || !draft.trim()) return;

    const newReply: CommunityReply = {
      id: Math.random().toString(),
      author: currentUser?.name || "Mama (Enugu)",
      role: "Mother",
      text: draft.trim(),
      timestamp: "Just now",
      likes: 0
    };

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, replies: [...p.replies, newReply] } : p))
    );

    setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
  };

  const filteredPosts = posts.filter((p) => {
    const matchesGroup = selectedGroup === "All Groups" || p.group === selectedGroup;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. COMMUNITY HERO BANNER */}
      <div className="bg-gradient-to-br from-[#32134F] via-[#521C6D] to-[#1E0B30] text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>Nigerian Mothers Sisterhood • Moderated by GMC Midwives</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>A Community That Truly Understands</span>
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400 inline" />
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              Connect with fellow expectant and new mothers across Enugu East. Share Omugwo stories, ask questions anonymously, and receive clinical answers from verified doctors.
            </p>
          </div>

          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer shrink-0 self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Share Story or Question</span>
          </button>
        </div>
      </div>

      {/* 2. GROUP FILTER TABS & SEARCH BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Trimester & Postpartum Groups Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              "All Groups",
              "1st Trimester",
              "2nd Trimester",
              "3rd Trimester",
              "Postpartum & Omugwo"
            ].map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedGroup === grp
                    ? "bg-brand-purple text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Omugwo, nausea, scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 3. NEW POST MODAL / POPUP */}
      <AnimatePresence>
        {showNewPostModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-brand-purple font-bold text-base">
                  <MessageSquare className="w-5 h-5 text-pink-500" />
                  <span>Start a Community Discussion</span>
                </div>
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Trimester or Topic Group
                  </label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
                  >
                    <option value="All Nigerian Mothers">All Nigerian Mothers Hub</option>
                    <option value="1st Trimester">1st Trimester (0-12 Weeks)</option>
                    <option value="2nd Trimester">2nd Trimester (13-27 Weeks)</option>
                    <option value="3rd Trimester">3rd Trimester & Delivery (28-40 Weeks)</option>
                    <option value="Postpartum & Omugwo">Postpartum & Omugwo Circle</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Discussion Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best remedy for leg swelling at 34 weeks?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Question or Experience Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share what you are feeling, traditional tips you received, or questions for GMC midwives..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-3 rounded-xl outline-none focus:border-brand-purple text-slate-800"
                    required
                  />
                </div>

                {/* Anonymous Posting Toggle */}
                <div
                  onClick={() => setPostAsAnonymous(!postAsAnonymous)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    postAsAnonymous
                      ? "bg-purple-50 border-purple-200 text-brand-purple"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <EyeOff className="w-4 h-4" />
                    <div>
                      <span className="font-bold">Post Anonymously (Private Sister Mode)</span>
                      <p className="text-[10px] text-slate-500">Your name will be hidden from other users.</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    postAsAnonymous ? "bg-brand-purple text-white border-brand-purple" : "border-slate-300"
                  }`}>
                    {postAsAnonymous && <span className="text-[9px]"><Check className="w-3 h-3" aria-hidden="true" /></span>}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewPostModal(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-purple hover:bg-dark-purple text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Publish Post
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. POSTS FEED STREAM */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-purple-200 transition-all"
          >
            {/* Header: Author & Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                  post.isAnonymous ? "bg-slate-100 text-slate-600" : "bg-purple-100 text-brand-purple"
                }`}>
                  {post.isAnonymous ? <Lock className="w-4 h-4 text-slate-600" /> : <User className="w-4 h-4 text-brand-purple" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-800">{post.author}</span>
                    {post.isAnonymous && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.2 rounded">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">{post.community} • {post.timestamp}</p>
                </div>
              </div>

              <span className="text-[10px] font-bold bg-purple-50 text-brand-purple border border-purple-100 px-2.5 py-1 rounded-full">
                {post.group}
              </span>
            </div>

            {/* Post Title & Content */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900 leading-snug">{post.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed">{post.content}</p>
            </div>

            {/* Likes & Actions Strip */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => handleLikePost(post.id)}
                className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  post.hasLiked
                    ? "bg-pink-50 text-pink-600 border border-pink-200"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${post.hasLiked ? "fill-pink-600" : ""}`} />
                <span>{post.likes} Helpful</span>
              </button>

              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{post.replies.length} Replies</span>
              </div>
            </div>

            {/* Replies Thread */}
            {post.replies.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100/80">
                {post.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                      reply.role === "GMC Clinician"
                        ? "bg-emerald-50/70 border border-emerald-200"
                        : reply.role === "TBA Midwife"
                        ? "bg-purple-50/70 border border-purple-200"
                        : "bg-slate-50 border border-slate-200/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{reply.author}</span>
                        {reply.badgeText && (
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full flex items-center gap-0.5 ${
                            reply.role === "GMC Clinician"
                              ? "bg-emerald-600 text-white"
                              : "bg-brand-purple text-white"
                          }`}>
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>{reply.badgeText}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">"{reply.text}"</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Box */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Write a supportive reply or advice..."
                value={replyDrafts[post.id] || ""}
                onChange={(e) =>
                  setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleAddReply(post.id)}
                className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
              />
              <button
                onClick={() => handleAddReply(post.id)}
                disabled={!replyDrafts[post.id]?.trim()}
                className="px-3.5 py-2 bg-brand-purple hover:bg-dark-purple disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reply
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
