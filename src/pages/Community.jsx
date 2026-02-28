import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { localStore } from '@/api/apiStore';
import Icon from '@/components/ui/Icon';
import PostCard from '@/components/community/PostCard';
import ChallengeCard from '@/components/community/ChallengeCard';
import ClanWar from '@/components/community/ClanWar';

const tabs = [
  { key: 'feed', label: 'ฟีด', icon: 'newspaper' },
  { key: 'challenges', label: 'ชาเลนจ์', icon: 'emoji_events' },
  { key: 'leaderboard', label: 'อันดับ', icon: 'group' },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostData, setNewPostData] = useState({ menu_name: '', caption: '', sodium_reduced: '', image_url: '' });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postsData, challengesData, participantsData, provincesData] = await Promise.all([
        localStore.entities.CommunityPost.list(),
        localStore.entities.Challenge.list(),
        localStore.entities.ChallengeParticipant.list(),
        localStore.entities.ProvinceScore.list(),
      ]);
      setPosts(postsData.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()));
      setChallenges(challengesData);
      setParticipants(participantsData);
      setJoinedChallenges(participantsData.map(p => p.challenge_id));
      setProvinces(provincesData);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheer = async (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, cheer_count: (p.cheer_count || 0) + 1 } : p
    ));
    const post = posts.find(p => p.id === postId);
    if (post) {
      await localStore.entities.CommunityPost.update(postId, {
        cheer_count: (post.cheer_count || 0) + 1
      });
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    if (joinedChallenges.includes(challengeId)) return;

    await localStore.entities.ChallengeParticipant.create({
      challenge_id: challengeId,
      progress: 0,
      completed: false,
      days_completed: 0,
    });

    // Update participant count
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      await localStore.entities.Challenge.update(challengeId, {
        participant_count: (challenge.participant_count || 0) + 1
      });
      setChallenges(prev => prev.map(c =>
        c.id === challengeId ? { ...c, participant_count: (c.participant_count || 0) + 1 } : c
      ));
    }

    setJoinedChallenges(prev => [...prev, challengeId]);
    setParticipants(prev => [...prev, { challenge_id: challengeId, progress: 0 }]);
  };

  const handleCreatePost = async () => {
    if (!newPostData.menu_name) return;
    setPosting(true);
    try {
      const newPost = await localStore.entities.CommunityPost.create({
        menu_name: newPostData.menu_name,
        caption: newPostData.caption,
        sodium_reduced: newPostData.sodium_reduced ? Number(newPostData.sodium_reduced) : undefined,
        image_url: newPostData.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
        region: 'central',
        province: 'กรุงเทพ',
        cheer_count: 0,
        created_by: 'คุณ',
      });
      setPosts(prev => [newPost, ...prev]);
      setNewPostData({ menu_name: '', caption: '', sodium_reduced: '', image_url: '' });
      setShowNewPost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'เมื่อสักครู่';
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-white">
      <div className="max-w-sm mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">วงข้าว</h1>
            <p className="text-sm text-slate-500">ชุมชนคนรักสุขภาพ</p>
          </div>
          <button
            onClick={() => setShowNewPost(true)}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-200 active:scale-95 transition-transform"
          >
            <Icon name="add" className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1 flex gap-1 mb-5 shadow-sm border border-slate-100">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Icon name={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Quick stats */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="auto_awesome" className="w-5 h-5" />
                  <span className="font-semibold">สรุปชุมชนวันนี้</span>
                </div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{posts.length}</p>
                    <p className="text-xs text-teal-100">โพสต์</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{challenges.filter(c => c.status === 'active').length}</p>
                    <p className="text-xs text-teal-100">ชาเลนจ์</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + (p.sodium_reduced || 0), 0)}%</p>
                    <p className="text-xs text-teal-100">ลดเค็มรวม</p>
                  </div>
                </div>
              </div>

              {/* Posts */}
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                  <span className="text-4xl">🍳</span>
                  <p className="text-slate-600 mt-3 font-medium">ยังไม่มีโพสต์</p>
                  <p className="text-slate-400 text-sm mt-1">เป็นคนแรกที่แชร์เมนูสุขภาพ!</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="relative">
                    <div className="absolute -left-1 top-4 text-[10px] text-slate-400 w-16 text-right -ml-2 hidden">
                      {getTimeAgo(post.created_date)}
                    </div>
                    <PostCard post={post} onCheer={handleCheer} />
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Active challenges header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Icon name="emoji_events" className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">ชาเลนจ์ที่เปิดอยู่</h2>
                  <p className="text-xs text-slate-500">{challenges.filter(c => c.status === 'active').length} ชาเลนจ์ • เข้าร่วมแล้ว {joinedChallenges.length}</p>
                </div>
              </div>

              {/* My challenges */}
              {joinedChallenges.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-teal-700 mb-2 flex items-center gap-1">
                    <Icon name="local_fire_department" className="w-4 h-4" />
                    ชาเลนจ์ของฉัน
                  </h3>
                  <div className="space-y-3">
                    {challenges
                      .filter(c => joinedChallenges.includes(c.id))
                      .map(challenge => {
                        const participant = participants.find(p => p.challenge_id === challenge.id);
                        return (
                          <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            isJoined={true}
                            progress={participant?.progress || Math.floor(Math.random() * 60 + 10)}
                            onJoin={handleJoinChallenge}
                          />
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Available challenges */}
              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-2">
                  {joinedChallenges.length > 0 ? 'ชาเลนจ์อื่นๆ' : 'เลือกชาเลนจ์ที่สนใจ'}
                </h3>
                <div className="space-y-3">
                  {challenges
                    .filter(c => !joinedChallenges.includes(c.id))
                    .map(challenge => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        isJoined={false}
                        progress={0}
                        onJoin={handleJoinChallenge}
                      />
                    ))}
                </div>
              </div>

              {joinedChallenges.length === challenges.length && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 text-center border border-amber-100">
                  <span className="text-3xl">🎉</span>
                  <p className="font-semibold text-slate-800 mt-2">เข้าร่วมครบทุกชาเลนจ์แล้ว!</p>
                  <p className="text-sm text-slate-500 mt-1">สู้ๆ ทำให้สำเร็จทุกอันนะ</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <ClanWar provinces={provinces} />

              {/* Sodium impact stats */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Icon name="trending_down" className="w-5 h-5 text-emerald-600" />
                  ผลกระทบรวมของชุมชน
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-2xl p-3">
                    <p className="text-2xl font-bold text-emerald-700">
                      {(provinces.reduce((sum, p) => sum + (p.total_sodium_reduced || 0), 0) / 1000).toFixed(1)}g
                    </p>
                    <p className="text-xs text-emerald-600">โซเดียมลดรวม</p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-3">
                    <p className="text-2xl font-bold text-blue-700">
                      {provinces.reduce((sum, p) => sum + (p.participant_count || 0), 0)}
                    </p>
                    <p className="text-xs text-blue-600">ผู้เข้าร่วมทั้งหมด</p>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-3">
                    <p className="text-2xl font-bold text-amber-700">{provinces.length}</p>
                    <p className="text-xs text-amber-600">จังหวัดที่เข้าร่วม</p>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-3">
                    <p className="text-2xl font-bold text-purple-700">
                      {challenges.filter(c => c.status === 'active').length}
                    </p>
                    <p className="text-xs text-purple-600">ชาเลนจ์กำลังเปิด</p>
                  </div>
                </div>
              </div>

              {/* All provinces list */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-3">อันดับจังหวัดทั้งหมด</h3>
                <div className="space-y-2">
                  {[...provinces]
                    .sort((a, b) => (b.total_sodium_reduced || 0) - (a.total_sodium_reduced || 0))
                    .map((prov, index) => (
                      <div key={prov.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-slate-100 text-slate-600' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-slate-50 text-slate-400'
                          }`}>
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{prov.province}</p>
                          <p className="text-xs text-slate-400">{prov.participant_count} คน</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600 text-sm">{(prov.total_sodium_reduced / 1000).toFixed(1)}g</p>
                          <p className="text-[10px] text-slate-400">โซเดียม</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800">แชร์เมนูสุขภาพ</h2>
                <button onClick={() => setShowNewPost(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Icon name="close" className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">ชื่อเมนู *</label>
                  <input
                    type="text"
                    value={newPostData.menu_name}
                    onChange={e => setNewPostData(prev => ({ ...prev, menu_name: e.target.value }))}
                    placeholder="เช่น ส้มตำลดเค็ม"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">เล่าให้ฟังหน่อย</label>
                  <textarea
                    value={newPostData.caption}
                    onChange={e => setNewPostData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="สูตรนี้ดียังไง ทำยังไง..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">ลดเค็มได้กี่ %</label>
                  <input
                    type="number"
                    value={newPostData.sodium_reduced}
                    onChange={e => setNewPostData(prev => ({ ...prev, sodium_reduced: e.target.value }))}
                    placeholder="เช่น 25"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">URL รูปภาพ</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPostData.image_url}
                      onChange={e => setNewPostData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://..."
                      className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400">
                      <Icon name="photo_camera" className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={!newPostData.menu_name || posting}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${newPostData.menu_name && !posting
                    ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  {posting ? (
                    <Icon name="progress_activity" className="w-4 h-4 animate-spin" />
                  ) : (
                    <>โพสต์เลย 🎉</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
